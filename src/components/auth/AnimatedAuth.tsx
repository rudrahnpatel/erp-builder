"use client";

import { useEffect, useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RiLoader4Line, RiUserLine, RiLockLine, RiMailLine, RiBriefcaseLine } from "react-icons/ri";
import { toast } from "sonner";

const textVariants = {
  enter: (isLogin: boolean) => ({
    x: isLogin ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (isLogin: boolean) => ({
    x: isLogin ? -30 : 30,
    opacity: 0,
  }),
};

const WaveBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="#dbeafe" />
    <path d="M0,40 C30,60 70,20 100,40 L100,100 L0,100 Z" fill="#bfdbfe" opacity="0.8" />
    <path d="M0,60 C40,40 60,80 100,60 L100,100 L0,100 Z" fill="#93c5fd" opacity="0.85" />
    <path d="M0,80 C30,100 70,60 100,80 L100,100 L0,100 Z" fill="#60a5fa" opacity="0.8" />
  </svg>
);

export function AnimatedAuth({ initialMode }: { initialMode: "login" | "register" }) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProviders()
      .then((p) => {
        if (!cancelled) setGoogleEnabled(!!p?.google);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = (login: boolean) => {
    if (isLogin === login) return;
    setIsLogin(login);
    window.history.pushState(null, "", login ? "/login" : "/register");
    setPassword("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) return;
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/workspace");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, workspaceName, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        toast.error("Failed to sign in after registration");
      } else {
        toast.success("Account created successfully!");
        router.push("/onboarding");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] h-[600px] flex rounded-[2rem] overflow-hidden shadow-2xl relative bg-white">

      {/*  LEFT PANEL: Graphic & Centered Content (50%)  */}
      <div className="w-[50%] h-full relative bg-[#eff6ff]">
        <WaveBackground />

        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
          
          {/* Welcome Message */}
          <div className="h-[140px] flex items-center justify-center mb-8 relative w-full">
            <AnimatePresence mode="wait" custom={isLogin}>
              <motion.div
                key={isLogin ? "login-msg" : "reg-msg"}
                custom={isLogin}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-center absolute w-full"
              >
                <h1 className="text-[54px] text-blue-950 font-display font-black italic leading-[1.1] mb-6">
                  {isLogin ? "Welcome Back!" : "Hello, Builder!"}
                </h1>
                <p className="text-blue-900/90 text-[16px] leading-relaxed max-w-[280px] font-bold mx-auto">
                  {isLogin
                    ? "Sign in to access your dashboard and continue building."
                    : "Create an account to start your journey with us."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Centered Horizontal Toggle */}
          <div className="relative flex items-center bg-white/40 backdrop-blur-md border border-white/50 rounded-full p-1.5 shadow-lg">
             {/* Animated Pill Background */}
             <motion.div
               className="absolute top-1.5 bottom-1.5 left-1.5 w-[120px] bg-blue-600 rounded-full shadow-md z-0"
               initial={false}
               animate={{ x: isLogin ? 0 : 120 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
             />
             
             <button
               onClick={() => setMode(true)}
               className={`relative z-10 w-[120px] py-2.5 text-sm font-extrabold tracking-wide uppercase transition-colors ${isLogin ? "text-white" : "text-blue-950/70 hover:text-blue-950"}`}
             >
               LOGIN
             </button>
             <button
               onClick={() => setMode(false)}
               className={`relative z-10 w-[120px] py-2.5 text-sm font-extrabold tracking-wide uppercase transition-colors ${!isLogin ? "text-white" : "text-blue-950/70 hover:text-blue-950"}`}
             >
               SIGN UP
             </button>
          </div>
        </div>
      </div>

      {/*  RIGHT PANEL: Forms (50%)  */}
      <div className="w-[50%] h-full relative z-20 bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[2rem] shadow-lg flex flex-col items-center justify-center">

        <div className="w-full h-full px-8 sm:px-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 p-1 shadow-lg mb-4 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <RiUserLine className="h-8 w-8 text-[#2563eb]" />
                  </div>
                </div>

                {/* Applied the elegant font-display here */}
                <h2 className="text-3xl font-bold mb-6 text-blue-800">Login</h2>

                <form onSubmit={handleLoginSubmit} className="w-full max-w-[300px]">
                  <div className="relative w-full border-b border-gray-300 pb-2 mb-6 flex items-center gap-4">
                    <RiUserLine className="h-[18px] w-[18px] text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                    />
                  </div>
                  <div className="relative w-full border-b border-gray-300 pb-2 mb-6 flex items-center gap-4">
                    <RiLockLine className="h-[18px] w-[18px] text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                    />
                  </div>

                  <div className="flex justify-between items-center w-full mt-8">
                    <a href="#" className="text-[11px] font-bold text-[#3b82f6] hover:underline">
                      Forgot Password?
                    </a>
                    <button
                      type="submit"
                      className="flex items-center justify-center rounded-full px-8 py-2.5 shadow-lg bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:opacity-90 transition-opacity text-white text-sm font-medium" disabled={loading || !isLogin}>
                      Login
                      {loading && isLogin ? <RiLoader4Line className="ml-2 h-4 w-4 animate-spin" /> : null}
                    </button>
                  </div>

                  {googleEnabled && (
                    <div className="mt-12 w-full flex items-center justify-between border-t border-gray-100 pt-6">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Or Login With</span>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black transition-colors"
                          disabled={googleLoading || loading || !isLogin}
                          onClick={() => {
                            setGoogleLoading(true);
                            signIn("google", { callbackUrl: "/workspace" });
                          }}
                        >
                          {googleLoading ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <GoogleMark />}
                          Google
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black transition-colors"
                        >
                          <FacebookMark />
                          Facebook
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full flex flex-col items-center"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 p-1 shadow-lg mb-3 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <RiUserLine className="h-6 w-6 text-[#06b6d4]" />
                  </div>
                </div>

                {/* Applied the elegant font-display here */}
                <h2 className="text-3xl font-bold mb-6 text-blue-700">Sign Up</h2>

                <form onSubmit={handleRegisterSubmit} className="w-full max-w-[300px]">
                  <div className="relative w-full border-b border-gray-300 pb-2 mb-5 flex items-center gap-4">
                    <RiUserLine className="h-[18px] w-[18px] text-gray-400" />
                    <input
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                    />
                  </div>
                  <div className="relative w-full border-b border-gray-300 pb-2 mb-5 flex items-center gap-4">
                    <RiMailLine className="h-[18px] w-[18px] text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                    />
                  </div>
                  <div className="relative w-full border-b border-gray-300 pb-2 mb-5 flex items-center gap-4">
                    <RiBriefcaseLine className="h-[18px] w-[18px] text-gray-400" />
                    <input
                      placeholder="Workspace Name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                    />
                  </div>
                  <div className="relative w-full border-b border-gray-300 pb-2 mb-5 flex items-center gap-4">
                    <RiLockLine className="h-[18px] w-[18px] text-gray-400" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                    />
                  </div>

                  <div className="flex justify-end w-full mt-8">
                    <button
                      type="submit"
                      className="flex items-center justify-center rounded-full px-8 py-2.5 shadow-lg bg-gradient-to-r from-[#06b6d4] to-[#2563eb] hover:opacity-90 transition-opacity text-white text-sm font-medium" disabled={loading || isLogin}>
                      Sign Up
                      {loading && !isLogin ? <RiLoader4Line className="ml-2 h-4 w-4 animate-spin" /> : null}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09a7 7 0 010-4.18V7.07H2.18a11 11 0 000 9.86l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
