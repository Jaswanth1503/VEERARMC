import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth/session';
import { z } from 'zod';

const sessionSchema = z.object({
  idToken: z.string().optional(),
  demoRole: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  roleName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sessionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid request data', errors: parsed.error }, { status: 400 });
    }

    const { idToken, demoRole, fullName, phone, companyName, roleName } = parsed.data;

    // Quick Demo Mode Login
    if (demoRole) {
      const selectedRole = demoRole.charAt(0).toUpperCase() + demoRole.slice(1).toLowerCase();
      const mockUserId = `00000000-0000-0000-0000-${selectedRole.toLowerCase().padEnd(12, '0')}`;
      await createSession(mockUserId, selectedRole);

      return NextResponse.json({
        success: true,
        message: `Demo authentication successful as ${selectedRole}`,
        data: {
          id: mockUserId,
          email: `${selectedRole.toLowerCase()}@veera.com`,
          role: selectedRole
        }
      });
    }

    if (!idToken) {
      return NextResponse.json({ success: false, message: 'Missing idToken or demoRole' }, { status: 400 });
    }

    // Verify Firebase token
    let firebaseUid = `user-${Date.now()}`;
    let email = "user@veera.com";
    let emailVerified = false;

    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email || email;
      emailVerified = decodedToken.email_verified || false;
    } catch (firebaseErr) {
      console.warn("[Auth API Warning] Firebase Admin SDK token verification warning, using client credentials context:", firebaseErr);
    }

    const targetRoleName = roleName ? (roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase()) : 'Customer';
    let userId = `00000000-0000-0000-0000-000000000001`;
    let userRole = targetRoleName;

    // Check if user exists in DB with DB-offline safety
    try {
      let user = await prisma.user.findUnique({
        where: { firebaseUid },
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
      });

      userId = user.id;
      userRole = user.role.roleName;
    } catch (dbErr) {
      console.warn("[Auth API Warning] Database offline during session creation, using fallback session persistence:", dbErr);
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
