"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button className="ghost-button min-h-11 px-4" disabled={isLoading} type="button" onClick={logout}>
      {isLoading ? "Signing Out" : "Logout"}
    </button>
  );
}
