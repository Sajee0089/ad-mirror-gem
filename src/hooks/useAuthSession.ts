import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Listener = (user: any | null) => void;

let userCache: any | null = null;
let loadingCache = true;
let subscription: { subscription: { unsubscribe: () => void } } | null = null;
let listeners = new Set<Listener>();

function notify() {
  for (const cb of listeners) cb(userCache);
}

export function useAuthSession() {
  const [user, setUser] = useState<any | null>(userCache);
  const [loading, setLoading] = useState<boolean>(loadingCache);

  useEffect(() => {
    let active = true;
    const cb: Listener = (u) => {
      if (!active) return;
      setUser(u);
      setLoading(false);
    };
    listeners.add(cb);

    (async () => {
      if (loadingCache) {
        const { data } = await supabase.auth.getUser();
        userCache = data.user ?? null;
        loadingCache = false;
        notify();
      }
      if (!subscription) {
        subscription = supabase.auth.onAuthStateChange((_event, session) => {
          userCache = session?.user ?? null;
          notify();
        });
      }
    })();

    return () => {
      active = false;
      listeners.delete(cb);
      if (listeners.size === 0 && subscription) {
        subscription.subscription.unsubscribe();
        subscription = null;
      }
    };
  }, []);

  return { user, loading, isLoggedIn: !!user };
}
