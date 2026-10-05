export interface CitizenUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  cityId?: string;
  role: "Citizen" | "Admin";
  registeredAt: string;
}

const LOCAL_STORAGE_KEY_USERS = "SMART_CITY_ACCOUNTS_DB";
const LOCAL_STORAGE_KEY_SESSION = "SMART_CITY_CURRENT_USER";

// Default seed accounts if storage is empty
const SEED_ACCOUNTS: CitizenUser[] = [
  {
    id: "usr-seed-1",
    name: "Sahil Mahajan",
    email: "sahil@smartcity.gov",
    password: "password123",
    phone: "+91 98765 43210",
    cityId: "pune",
    role: "Citizen",
    registeredAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "usr-seed-2",
    name: "Municipal Administrator",
    email: "admin@smartcity.gov",
    password: "admin123",
    phone: "+91 1800 233 4567",
    cityId: "pune",
    role: "Admin",
    registeredAt: "2026-01-01T08:00:00.000Z",
  },
];

/**
 * Retrieve all registered users from localStorage
 */
export function getAllRegisteredUsers(): CitizenUser[] {
  if (typeof window === "undefined") return SEED_ACCOUNTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ACCOUNTS;
  } catch (err) {
    console.error("Failed to read user storage:", err);
    return SEED_ACCOUNTS;
  }
}

/**
 * Create a new user account and save to localStorage
 */
export function createCitizenAccount(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cityId?: string;
}): { success: boolean; error?: string; user?: CitizenUser } {
  if (typeof window === "undefined") {
    return { success: false, error: "Storage not available in SSR mode" };
  }

  const emailTrimmed = data.email.trim().toLowerCase();
  const nameTrimmed = data.name.trim();

  if (!emailTrimmed || !data.password) {
    return { success: false, error: "Email and password are required" };
  }

  const existingUsers = getAllRegisteredUsers();
  const duplicate = existingUsers.find(
    (u) => u.email.toLowerCase() === emailTrimmed
  );

  if (duplicate) {
    return { success: false, error: "An account with this email already exists" };
  }

  const newUser: CitizenUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: nameTrimmed || emailTrimmed.split("@")[0],
    email: emailTrimmed,
    password: data.password,
    phone: data.phone?.trim() || "+91 99000 00000",
    cityId: data.cityId || "pune",
    role: emailTrimmed.includes("admin") ? "Admin" : "Citizen",
    registeredAt: new Date().toISOString(),
  };

  const updatedUsers = [...existingUsers, newUser];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
    // Automatically set current session on register
    setCurrentUserSession(newUser);
    return { success: true, user: newUser };
  } catch (err) {
    return { success: false, error: "Failed to write user to localStorage" };
  }
}

/**
 * Authenticate against localStorage users
 */
export function authenticateCitizen(
  email: string,
  password: string
): { success: boolean; error?: string; user?: CitizenUser } {
  const emailTrimmed = email.trim().toLowerCase();
  const existingUsers = getAllRegisteredUsers();

  const user = existingUsers.find(
    (u) => u.email.toLowerCase() === emailTrimmed
  );

  if (!user) {
    return { success: false, error: "No account found with this email" };
  }

  if (user.password !== password) {
    return { success: false, error: "Invalid password. Please try again." };
  }

  setCurrentUserSession(user);
  return { success: true, user };
}

/**
 * Get active user session from localStorage
 */
export function getCurrentUserSession(): CitizenUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save user session to localStorage
 */
export function setCurrentUserSession(user: CitizenUser): void {
  if (typeof window === "undefined") return;
  try {
    const sanitized = { ...user };
    delete sanitized.password; // do not store raw password in active session state
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(sanitized));
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

/**
 * Clear active user session
 */
export function clearCurrentUserSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
  } catch (err) {
    console.error("Failed to clear session:", err);
  }
}
