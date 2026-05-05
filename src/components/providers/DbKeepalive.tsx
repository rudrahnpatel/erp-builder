"use client";

import { useEffect } from "react";

export function DbKeepalive() {
  useEffect(() => {
    // Ping the health endpoint to prevent the database from going to sleep
    const ping = () => fetch("/api/health").catch(() => {});
    
    // Immediate warm-up when the app loads
    ping();
    
    // Ping every 4 minutes (Neon serverless sleeps after 5 min of inactivity)
    const id = setInterval(ping, 4 * 60 * 1000);
    
    return () => clearInterval(id);
  }, []);
  
  return null;
}
