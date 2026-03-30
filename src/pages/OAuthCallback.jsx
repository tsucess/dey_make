import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Logo from "../components/Logo";
import NetworkIllustration from "../components/NetworkIllustration";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { firstError } from "../services/api";

function readHashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  return new URLSearchParams(hash);
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { authenticateWithToken } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const hashParams = useMemo(() => readHashParams(), []);
  const provider = hashParams.get("provider") || searchParams.get("provider") || "";
  const token = hashParams.get("token") || searchParams.get("token") || "";
  const initialError = hashParams.get("error") || searchParams.get("error") || "";
  const [error, setError] = useState(initialError);

  useEffect(() => {
    let ignore = false;

    if (typeof window !== "undefined" && window.location.hash) {
      window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
    }

    if (error) return () => {
      ignore = true;
    };

    if (!token) {
      setError(t("oauthCallback.missingToken"));
      return () => {
        ignore = true;
      };
    }

    authenticateWithToken(token)
      .then(() => {
        if (!ignore) navigate("/home", { replace: true });
      })
      .catch((nextError) => {
        if (!ignore) {
          setError(firstError(nextError?.errors, nextError?.message || t("oauthCallback.unableToCompleteSignIn")));
        }
      });

    return () => {
      ignore = true;
    };
  }, [authenticateWithToken, error, navigate, t, token]);

  const providerLabel = useMemo(() => {
    if (!provider) return t("oauthCallback.yourAccount");

    const normalizedProvider = provider.toLowerCase();
    const translatedProvider = t(`social.${normalizedProvider}`);

    if (translatedProvider !== `social.${normalizedProvider}`) return translatedProvider;

    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [provider, t]);

  return (
    <AuthLayout>
      <Logo />
      <NetworkIllustration />

      <div className="pt-8 text-center">
        <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
          {error ? t("oauthCallback.signInFailed", { provider: providerLabel }) : t("oauthCallback.finishingSignIn", { provider: providerLabel })}
        </h2>
        <p className={`mx-auto max-w-md rounded-md px-4 py-3 text-sm ${error
          ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
          : "bg-gray-50 text-slate-600 dark:bg-[#1f1f1f] dark:text-slate-200"}`}
        >
          {error || t("oauthCallback.waitingMessage")}
        </p>

        {error ? (
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-5 rounded-md bg-orange100 px-5 py-3 text-sm font-semibold text-slate100 transition-colors hover:bg-[#e09510]"
          >
            {t("oauthCallback.backToLogin")}
          </button>
        ) : null}
      </div>
    </AuthLayout>
  );
}