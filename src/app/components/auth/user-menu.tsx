"use client";

import { useState } from "react";
import { authClient } from "@/app/utils/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/auth";
import Image from "next/image";
import { ProfileSettingsModal } from "../profile-settings-modal";

type User = Session['user'];

interface UserMenuProps {
	user: User;
}

export function UserMenu({ user: initialUser }: UserMenuProps) {
	const router = useRouter();
	const [user, setUser] = useState(initialUser);
	const [showProfileSettings, setShowProfileSettings] = useState(false);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/login");
		router.refresh();
	};

	const handleProfileUpdate = (updatedUser: User) => {
		setUser(updatedUser);
	};

	return (
		<div className="relative group">
			<button className="flex items-center space-x-2 text-sm bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-md transition-colors">
				{user.image ? (
					<Image
						src={user.image}
						alt={user.name}
						width={24}
						height={24}
						className="w-6 h-6 rounded-full"
					/>
				) : (
					<div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
						{user.name.charAt(0).toUpperCase()}
					</div>
				)}
				<span className="hidden sm:block text-foreground">{user.name}</span>
				<svg
					className="w-4 h-4 text-muted-foreground"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			<div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
				<div className="py-1">
					<div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
						<div className="font-medium text-foreground">{user.name}</div>
						<div className="truncate">{user.email}</div>
					</div>
					<button
						onClick={() => setShowProfileSettings(true)}
						className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
					>
						Profile Settings
					</button>
					<button
						onClick={handleSignOut}
						className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
					>
						Sign out
					</button>
				</div>
			</div>
			<ProfileSettingsModal
				isOpen={showProfileSettings}
				onClose={() => setShowProfileSettings(false)}
				user={user}
				onUpdate={handleProfileUpdate}
			/>
		</div>
	);
}
