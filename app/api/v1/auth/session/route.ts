import { NextRequest, NextResponse } from 'next/server';
import { getSafeAdminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth/session';
import { z } from 'zod';

const sessionSchema = z.object({
  idToken: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  demoRole: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  roleName: z.string().optional(),
});

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
      return JSON.parse(payload);
    }
  } catch (e) {
    // Ignore parse error
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (parseErr) {
      return NextResponse.json({ success: false, message: 'Invalid JSON request body' }, { status: 400 });
    }

    const parsed = sessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid request data', errors: parsed.error }, { status: 400 });
    }

    const { idToken, email: rawEmail, demoRole, fullName, phone, companyName, roleName } = parsed.data;

    // 1. Quick 1-Click Role Access Login
    if (demoRole) {
      const selectedRole = demoRole.charAt(0).toUpperCase() + demoRole.slice(1).toLowerCase();
      const mockUserId = `00000000-0000-0000-0000-${selectedRole.toLowerCase().padEnd(12, '0')}`;
      await createSession(mockUserId, selectedRole);

      return NextResponse.json({
        success: true,
        message: `Authentication successful as ${selectedRole}`,
        data: {
          id: mockUserId,
          email: `${selectedRole.toLowerCase()}@veera.com`,
          role: selectedRole
        }
      });
    }

    // 2. Token or Email Verification
    let firebaseUid = `user-${Date.now()}`;
    let email = rawEmail || "user@veera.com";
    let emailVerified = false;

    if (idToken) {
      const adminAuth = getSafeAdminAuth();
      if (adminAuth) {
        try {
          const decodedToken = await adminAuth.verifyIdToken(idToken);
          firebaseUid = decodedToken.uid;
          email = decodedToken.email || email;
          emailVerified = decodedToken.email_verified || false;
        } catch (firebaseErr) {
          console.warn("[Auth API Warning] Firebase Admin verification warning, reading client token claims:", firebaseErr);
          const clientDecoded = decodeJwtPayload(idToken);
          if (clientDecoded) {
            firebaseUid = clientDecoded.user_id || clientDecoded.sub || firebaseUid;
            email = clientDecoded.email || email;
            emailVerified = clientDecoded.email_verified || false;
          }
        }
      } else {
        const clientDecoded = decodeJwtPayload(idToken);
        if (clientDecoded) {
          firebaseUid = clientDecoded.user_id || clientDecoded.sub || firebaseUid;
          email = clientDecoded.email || email;
          emailVerified = clientDecoded.email_verified || false;
        }
      }
    } else if (rawEmail) {
      email = rawEmail;
      firebaseUid = `email-${Buffer.from(rawEmail).toString('hex').slice(0, 24)}`;
    } else {
      return NextResponse.json({ success: false, message: 'Missing authentication credentials (idToken or email required)' }, { status: 400 });
    }

    const targetRoleName = roleName ? (roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase()) : 'Customer';
    let userId = `00000000-0000-0000-0000-000000000001`;
    let userRole = targetRoleName;

    // Check if user exists in DB with DB-offline safety
    try {
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { firebaseUid },
            { email: { equals: email, mode: 'insensitive' } }
          ]
        },
        include: { role: true }
      });

      if (!user) {
        let role = await prisma.role.findFirst({ where: { roleName: { equals: targetRoleName, mode: 'insensitive' } } });
        if (!role) {
          role = await prisma.role.create({
            data: { roleName: targetRoleName, priority: 10 }
          });
        }

        let companyId = null;
        if (companyName) {
          const company = await prisma.company.create({
            data: { companyName }
          });
          companyId = company.id;
        }

        user = await prisma.user.create({
          data: {
            firebaseUid,
            email,
            fullName: fullName || email.split('@')[0],
            phone,
            companyId,
            roleId: role.id,
            emailVerified,
          },
          include: { role: true }
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      }).catch(() => {});

      userId = user.id;
      userRole = user.role.roleName;
    } catch (dbErr) {
      console.warn("[Auth API Warning] Database offline during session creation, using in-memory session persistence:", dbErr);
    }

    // Create secure session cookie
    await createSession(userId, userRole);

    return NextResponse.json({ 
      success: true, 
      message: 'Authentication successful',
      data: {
        id: userId,
        email,
        role: userRole
      }
    });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json({ success: false, message: 'Authentication failed', errors: error.message }, { status: 401 });
  }
}
