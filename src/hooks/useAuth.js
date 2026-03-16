import { useContext } from "react";
<<<<<<< HEAD
import { AuthContext } from "../context/auth-context";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
=======
// import { AuthContext } from "../context/AuthContext";

export function useAuth() {
    // const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
>>>>>>> 715a63c66022252c7cc3b7fbe2d1a6a49c3e59e3
}
