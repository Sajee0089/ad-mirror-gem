import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    const evaluate = async (session: any) => {
      if (!session) { if (!cancelled) setStatus("denied"); return; }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");
      if (!cancelled) setStatus(roles && roles.length > 0 ? "admin" : "denied");
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) evaluate(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => evaluate(session));
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === "denied") return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
