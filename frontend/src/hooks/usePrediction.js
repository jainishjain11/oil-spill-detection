import { useMutation } from "@tanstack/react-query";
import { predictImage } from "../services/api";
import useSessionStore from "../store/sessionStore";
import toast from "react-hot-toast";

/**
 * React Query mutation hook for POST /predict.
 * On success, automatically appends result to Zustand session store.
 *
 * @returns useMutation result (mutate, isPending, data, error, reset)
 */
export function usePrediction() {
  const addResult = useSessionStore((s) => s.addResult);

  const mutation = useMutation({
    mutationFn: ({ file, mcRuns, enableGradcam }) =>
      predictImage(file, mcRuns, enableGradcam),

    onSuccess: (data) => {
      addResult(data);
    },

    onError: (error) => {
      const msg =
        error?.response?.data?.detail ||
        error?.message ||
        "Prediction failed. Check that the backend is running.";
      toast.error(msg, { duration: 5000 });
    },
  });

  return mutation;
}
