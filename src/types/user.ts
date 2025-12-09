export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName?: string;
	role: UserRole;
	isActive?: boolean;
}

