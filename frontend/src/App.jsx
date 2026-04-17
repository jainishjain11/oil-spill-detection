import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1f2e",
            color: "#e2e8f0",
            border: "1px solid #2d3548",
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#1a1f2e" },
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#1a1f2e" },
          },
        }}
      />
    </QueryClientProvider>
  );
}
