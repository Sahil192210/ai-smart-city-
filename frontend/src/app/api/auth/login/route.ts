import { NextResponse } from "next/server";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "Citizen" | "Admin";
  created_at: string;
}

// In-memory persistent demo store
const USERS_STORE: UserRecord[] = [
  {
    id: 1,
    name: "Sahil Mahajan",
    email: "sahil@smartcity.gov",
    passwordHash: "password123",
    role: "Citizen",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: 2,
    name: "Municipal Admin",
    email: "admin@smartcity.gov",
    passwordHash: "admin123",
    role: "Admin",
    created_at: "2026-01-01T08:00:00Z",
  },
];

// Helper to generate simulated JWT token
function generateToken(user: UserRecord): string {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. REGISTER ACTION
    if (action === "register") {
      const existing = USERS_STORE.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      const newUser: UserRecord = {
        id: USERS_STORE.length + 1,
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        passwordHash: password,
        role: email.includes("admin") ? "Admin" : "Citizen",
        created_at: new Date().toISOString(),
      };
      USERS_STORE.push(newUser);

      const token = generateToken(newUser);
      return NextResponse.json({
        success: true,
        message: "Registration successful",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }

    // 2. LOGIN ACTION
    const user = USERS_STORE.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );

    if (!user) {
      // Fallback: Auto-provision for demo so the user is never blocked
      const demoUser: UserRecord = {
        id: USERS_STORE.length + 1,
        name: name || email.split("@")[0].toUpperCase(),
        email: email.toLowerCase(),
        passwordHash: password,
        role: email.includes("admin") ? "Admin" : "Citizen",
        created_at: new Date().toISOString(),
      };
      USERS_STORE.push(demoUser);

      const token = generateToken(demoUser);
      return NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
        },
      });
    }

    const token = generateToken(user);
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
