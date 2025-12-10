export type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

export interface Permission {
	id?: string;
	name: string;
	description?: string;
}

export interface Role {
	id?: string;
	name: string;
	permissions: Permission[];
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName?: string;
	role: UserRole | Role; // Can be string or full Role object
	permissions?: Permission[]; // Direct permissions on user (optional)
	isActive?: boolean;
}

