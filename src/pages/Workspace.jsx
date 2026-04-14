import { useEffect, useMemo, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Layout/Spinner";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api, firstError } from "../services/api";

const tabs = [
  ["monetize", "settings.workspace.tabs.monetize"],
  ["commerce", "settings.workspace.tabs.commerce"],
  ["growth", "settings.workspace.tabs.growth"],
];

const defaultMonetization = {
  loaded: false,
  verification: { status: "unsubmitted", request: null, verifiedAt: null },
  summary: null,
  account: null,
  payouts: [],
  transactions: [],
  tips: [],
  agreements: [],
};

const defaultCommerce = {
  loaded: false,
  campaigns: [],
  campaignMatches: {},
  proposalsSent: [],
  proposalsInbox: [],
  products: [],
  receivedOrders: [],
  myOrders: [],
  discovery: [],
};

const defaultGrowth = {
  loaded: false,
  courses: [],
  enrollments: [],
  selectedCourse: null,
  aiProjects: [],
  offlineItems: [],
};

const defaultVerificationForm = {
  legalName: "",
  country: "Nigeria",
  documentType: "passport",
  documentUrl: "",
  about: "",
  socialLinks: "",
};

const defaultPayoutAccountForm = {
  provider: "bank_transfer",
  accountName: "",
  accountReference: "",
  bankName: "",
  bankCode: "",
  currency: "NGN",
};

const defaultRevenueShareForm = {
  recipientId: "",
  title: "",
  sourceType: "general",
  sharePercentage: "40",
  currency: "NGN",
  notes: "",
};

const defaultCampaignForm = {
  title: "",
  objective: "awareness",
  status: "draft",
  budgetAmount: "",
  currency: "NGN",
  minSubscribers: "0",
  deliverables: "",
};

const defaultSponsorshipForm = {
  recipientId: "",
  brandCampaignId: "",
  title: "",
  brief: "",
  feeAmount: "",
  currency: "NGN",
  deliverables: "",
};

const defaultProductForm = {
  name: "",
  description: "",
  priceAmount: "",
  currency: "NGN",
  inventoryCount: "0",
  images: "",
};

const defaultDiscoveryFilters = {
  q: "",
  categoryId: "",
  verifiedOnly: true,
  hasActivePlans: true,
  minSubscribers: "",
};

const defaultAiProjectForm = {
  sourceVideoId: "",
  sourceUploadId: "",
  title: "",
  operations: "hooks, cutdowns, thumbnails",
};

const defaultOfflineForm = {
  clientReference: "",
  type: "video",
  title: "",
  uploadId: "",
  videoId: "",
  status: "queued",
  metadata: "",
};

function parseList(value) {
  return `${value || ""}`
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDateTime(value, fallback = "—") {
  if (!value) return fallback;

  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(amount, currency = "NGN") {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format((Number(amount) || 0) / 100);
  } catch {
    return `${currency} ${amount || 0}`;
  }
}

function profileName(profile = {}) {
  return profile.fullName || profile.username || `User #${profile.id || "—"}`;
}

function StatusPill({ children }) {
  return <span className="rounded-full bg-orange100/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-200">{children}</span>;
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#1D1D1D]">
      <p className="text-xs uppercase tracking-wide text-slate500 dark:text-slate300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate100 dark:text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate500 dark:text-slate300">{hint}</p> : null}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate100 dark:text-white">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate500 dark:text-slate300">{hint}</span> : null}
    </label>
  );
}

function Input(props) {
  return <input {...props} className={`w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate100 outline-none transition focus:border-orange100 dark:border-white/10 dark:bg-[#121212] dark:text-white ${props.className || ""}`} />;
}

function Textarea(props) {
  return <textarea {...props} className={`min-h-28 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate100 outline-none transition focus:border-orange100 dark:border-white/10 dark:bg-[#121212] dark:text-white ${props.className || ""}`} />;
}

function Select(props) {
  return <select {...props} className={`w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate100 outline-none transition focus:border-orange100 dark:border-white/10 dark:bg-[#121212] dark:text-white ${props.className || ""}`} />;
}

function Card({ title, description, children, action }) {
  return (
    <section className="rounded-3xl bg-white300 p-5 dark:bg-black100 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate100 dark:text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate600 dark:text-slate200">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ children }) {
  return <div className="rounded-2xl border border-dashed border-black/10 px-4 py-5 text-sm text-slate600 dark:border-white/10 dark:text-slate200">{children}</div>;
}

export default function Workspace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("monetize");
  const [loadingTab, setLoadingTab] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [monetization, setMonetization] = useState(defaultMonetization);
  const [commerce, setCommerce] = useState(defaultCommerce);
  const [growth, setGrowth] = useState(defaultGrowth);
  const [verificationForm, setVerificationForm] = useState(defaultVerificationForm);
  const [payoutAccountForm, setPayoutAccountForm] = useState(defaultPayoutAccountForm);
  const [payoutRequest, setPayoutRequest] = useState({ amount: "", notes: "" });
  const [revenueShareForm, setRevenueShareForm] = useState(defaultRevenueShareForm);
  const [settlementDrafts, setSettlementDrafts] = useState({});
  const [campaignForm, setCampaignForm] = useState(defaultCampaignForm);
  const [sponsorshipForm, setSponsorshipForm] = useState(defaultSponsorshipForm);
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [discoveryFilters, setDiscoveryFilters] = useState(defaultDiscoveryFilters);
  const [aiProjectForm, setAiProjectForm] = useState(defaultAiProjectForm);
  const [offlineForm, setOfflineForm] = useState(defaultOfflineForm);

  const tabLoading = loadingTab === activeTab;
  const currency = monetization.summary?.currency || payoutAccountForm.currency || "NGN";

  useEffect(() => {
    if (activeTab === "monetize" && !monetization.loaded) loadMonetization();
    if (activeTab === "commerce" && !commerce.loaded) loadCommerce();
    if (activeTab === "growth" && !growth.loaded) loadGrowth();
  }, [activeTab]);

  async function runAction(key, handler) {
    setBusyAction(key);
    setError("");
    setFeedback("");

    try {
      const response = await handler();
      if (response?.message) setFeedback(response.message);
      return response;
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("settings.unableToUpdate")));
      throw nextError;
    } finally {
      setBusyAction("");
    }
  }

  async function loadMonetization() {
    setLoadingTab("monetize");

    try {
      const [verificationResponse, summaryResponse, accountResponse, payoutsResponse, transactionsResponse, tipsResponse, sharesResponse] = await Promise.all([
        api.getCreatorVerification(),
        api.getMonetizationSummary(),
        api.getPayoutAccount(),
        api.getMonetizationPayouts(),
        api.getMonetizationTransactions({ perPage: 6 }),
        api.getTipsReceived(),
        api.getRevenueShares(),
      ]);

      const account = accountResponse?.data?.account || null;
      setMonetization({
        loaded: true,
        verification: verificationResponse?.data || defaultMonetization.verification,
        summary: summaryResponse?.data?.summary || null,
        account,
        payouts: payoutsResponse?.data?.payouts || [],
        transactions: transactionsResponse?.data?.transactions || [],
        tips: tipsResponse?.data?.tips || [],
        agreements: sharesResponse?.data?.agreements || [],
      });
      if (account) {
        setPayoutAccountForm({
          provider: account.provider || "bank_transfer",
          accountName: account.accountName || "",
          accountReference: "",
          bankName: account.bankName || "",
          bankCode: account.bankCode || "",
          currency: account.currency || "NGN",
        });
      }
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("settings.unableToLoad")));
    } finally {
      setLoadingTab("");
    }
  }

  async function loadCommerce() {
    if (!user?.id) return;
    setLoadingTab("commerce");

    try {
      const [campaignsResponse, sentResponse, inboxResponse, productsResponse, receivedOrdersResponse, myOrdersResponse, discoveryResponse] = await Promise.all([
        api.getBrandCampaigns(),
        api.getSponsorshipProposals({ scope: "sent" }),
        api.getSponsorshipProposals({ scope: "inbox" }),
        api.getUserMerch(user.id),
        api.getReceivedMerchOrders(),
        api.getMyMerchOrders(),
        api.getTalentDiscovery(discoveryFilters),
      ]);

      setCommerce({
        loaded: true,
        campaigns: campaignsResponse?.data?.campaigns || [],
        campaignMatches: {},
        proposalsSent: sentResponse?.data?.proposals || [],
        proposalsInbox: inboxResponse?.data?.proposals || [],
        products: productsResponse?.data?.products || [],
        receivedOrders: receivedOrdersResponse?.data?.orders || [],
        myOrders: myOrdersResponse?.data?.orders || [],
        discovery: discoveryResponse?.data?.creators || [],
      });
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("settings.unableToLoad")));
    } finally {
      setLoadingTab("");
    }
  }

  async function loadGrowth() {
    setLoadingTab("growth");

    try {
      const [coursesResponse, learningResponse, aiResponse, offlineResponse] = await Promise.all([
        api.getAcademyCourses(),
        api.getMyAcademyLearning(),
        api.getAiStudioProjects(),
        api.getOfflineUploadQueue(),
      ]);

      setGrowth({
        loaded: true,
        courses: coursesResponse?.data?.courses || [],
        enrollments: learningResponse?.data?.enrollments || [],
        selectedCourse: null,
        aiProjects: aiResponse?.data?.projects || [],
        offlineItems: offlineResponse?.data?.items || [],
      });
    } catch (nextError) {
      setError(firstError(nextError?.errors, nextError?.message || t("settings.unableToLoad")));
    } finally {
      setLoadingTab("");
    }
  }

  async function refreshDiscovery() {
    const response = await api.getTalentDiscovery({ ...discoveryFilters, minSubscribers: Number(discoveryFilters.minSubscribers) || undefined });
    setCommerce((current) => ({ ...current, discovery: response?.data?.creators || [] }));
  }

  async function handleSubmitVerification() {
    await runAction("verification", async () => {
      const response = await api.submitCreatorVerification({ ...verificationForm, socialLinks: parseList(verificationForm.socialLinks) });
      await loadMonetization();
      return response;
    });
  }

  async function handleSavePayoutAccount() {
    await runAction("payout-account", async () => {
      const response = await api.savePayoutAccount(payoutAccountForm);
      await loadMonetization();
      return response;
    });
  }

  async function handleRequestPayout() {
    await runAction("payout-request", async () => {
      const response = await api.requestPayout({ amount: Number(payoutRequest.amount) || 0, notes: payoutRequest.notes || null });
      setPayoutRequest({ amount: "", notes: "" });
      await loadMonetization();
      return response;
    });
  }

  async function handleCreateRevenueShare() {
    await runAction("revenue-share", async () => {
      const response = await api.createRevenueShare({
        recipientId: Number(revenueShareForm.recipientId),
        title: revenueShareForm.title,
        sourceType: revenueShareForm.sourceType,
        sharePercentage: Number(revenueShareForm.sharePercentage) || 0,
        currency: revenueShareForm.currency,
        notes: revenueShareForm.notes || null,
      });
      setRevenueShareForm(defaultRevenueShareForm);
      await loadMonetization();
      return response;
    });
  }

  async function handleRevenueShareAction(agreementId, action) {
    await runAction(`revenue-share-${agreementId}-${action}`, async () => {
      const response = await api.updateRevenueShare(agreementId, { action });
      await loadMonetization();
      return response;
    });
  }

  async function handleCreateSettlement(agreementId) {
    await runAction(`settlement-${agreementId}`, async () => {
      const response = await api.createRevenueShareSettlement(agreementId, { grossAmount: Number(settlementDrafts[agreementId]) || 0 });
      setSettlementDrafts((current) => ({ ...current, [agreementId]: "" }));
      await loadMonetization();
      return response;
    });
  }

  async function handleCreateCampaign() {
    await runAction("campaign", async () => {
      const response = await api.createBrandCampaign({
        title: campaignForm.title,
        objective: campaignForm.objective,
        status: campaignForm.status,
        budgetAmount: Number(campaignForm.budgetAmount) || 0,
        currency: campaignForm.currency,
        minSubscribers: Number(campaignForm.minSubscribers) || 0,
        deliverables: parseList(campaignForm.deliverables),
      });
      setCampaignForm(defaultCampaignForm);
      await loadCommerce();
      return response;
    });
  }

  async function handleLoadMatches(campaignId) {
    await runAction(`campaign-matches-${campaignId}`, async () => {
      const response = await api.getBrandCampaignMatches(campaignId, { verifiedOnly: true, hasActivePlans: true });
      setCommerce((current) => ({
        ...current,
        campaignMatches: { ...current.campaignMatches, [campaignId]: response?.data?.creators || [] },
      }));
      return response;
    });
  }

  async function handleCreateSponsorship() {
    await runAction("sponsorship", async () => {
      const response = await api.createSponsorshipProposal({
        recipientId: Number(sponsorshipForm.recipientId),
        brandCampaignId: sponsorshipForm.brandCampaignId ? Number(sponsorshipForm.brandCampaignId) : null,
        title: sponsorshipForm.title,
        brief: sponsorshipForm.brief || null,
        feeAmount: Number(sponsorshipForm.feeAmount) || 0,
        currency: sponsorshipForm.currency,
        deliverables: parseList(sponsorshipForm.deliverables),
      });
      setSponsorshipForm(defaultSponsorshipForm);
      await loadCommerce();
      return response;
    });
  }

  async function handleProposalAction(proposalId, action) {
    await runAction(`proposal-${proposalId}-${action}`, async () => {
      const response = await api.updateSponsorshipProposal(proposalId, { action });
      await loadCommerce();
      return response;
    });
  }

  async function handleCreateProduct() {
    await runAction("product", async () => {
      const response = await api.createMerchProduct({
        name: productForm.name,
        description: productForm.description || null,
        priceAmount: Number(productForm.priceAmount) || 0,
        currency: productForm.currency,
        inventoryCount: Number(productForm.inventoryCount) || 0,
        images: parseList(productForm.images),
      });
      setProductForm(defaultProductForm);
      await loadCommerce();
      return response;
    });
  }

  async function handleOrderAction(orderId, action) {
    await runAction(`order-${orderId}-${action}`, async () => {
      const response = await api.updateMerchOrder(orderId, { action });
      await loadCommerce();
      return response;
    });
  }

  async function handleOpenCourse(courseId) {
    await runAction(`course-${courseId}`, async () => {
      const response = await api.getAcademyCourse(courseId);
      setGrowth((current) => ({ ...current, selectedCourse: response?.data?.course || null }));
      return response;
    });
  }

  async function handleEnrollCourse(courseId) {
    await runAction(`enroll-${courseId}`, async () => {
      const response = await api.enrollInAcademyCourse(courseId);
      await loadGrowth();
      return response;
    });
  }

  async function handleCompleteLesson(lessonId) {
    await runAction(`lesson-${lessonId}`, async () => {
      const response = await api.completeAcademyLesson(lessonId);
      await loadGrowth();
      return response;
    });
  }

  async function handleCreateAiProject() {
    await runAction("ai-project", async () => {
      const response = await api.createAiStudioProject({
        sourceVideoId: aiProjectForm.sourceVideoId ? Number(aiProjectForm.sourceVideoId) : null,
        sourceUploadId: aiProjectForm.sourceUploadId ? Number(aiProjectForm.sourceUploadId) : null,
        title: aiProjectForm.title || null,
        operations: parseList(aiProjectForm.operations),
      });
      setAiProjectForm(defaultAiProjectForm);
      await loadGrowth();
      return response;
    });
  }

  async function handleGenerateAiProject(projectId) {
    await runAction(`ai-generate-${projectId}`, async () => {
      const response = await api.generateAiStudioProject(projectId);
      await loadGrowth();
      return response;
    });
  }

  async function handleSaveOfflineItem() {
    await runAction("offline-item", async () => {
      const response = await api.saveOfflineUploadItem({
        clientReference: offlineForm.clientReference,
        type: offlineForm.type,
        title: offlineForm.title || null,
        uploadId: offlineForm.uploadId ? Number(offlineForm.uploadId) : null,
        videoId: offlineForm.videoId ? Number(offlineForm.videoId) : null,
        status: offlineForm.status,
        metadata: offlineForm.metadata ? { note: offlineForm.metadata } : null,
      });
      setOfflineForm(defaultOfflineForm);
      await loadGrowth();
      return response;
    });
  }

  async function handleSyncOfflineItem(itemId, videoId) {
    await runAction(`offline-sync-${itemId}`, async () => {
      const response = await api.updateOfflineUploadItem(itemId, { status: "synced", videoId: videoId || null });
      await loadGrowth();
      return response;
    });
  }

  const monetizationCards = useMemo(() => {
    const earnings = monetization.summary?.earnings || {};
    return [
      ["Gross revenue", formatMoney(earnings.grossRevenue || 0, currency)],
      ["Available balance", formatMoney(earnings.availableBalance || 0, currency)],
      ["Pending payouts", formatMoney(earnings.pendingPayouts || 0, currency)],
    ];
  }, [currency, monetization.summary]);

  return (
    <div className="min-h-full bg-white px-4 pb-24 pt-2 dark:bg-slate100 md:px-10 md:py-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white300 md:hidden">
        <IoIosArrowBack className="h-5 w-5 text-slate900" />
      </button>

      <div className="mx-auto max-w-7xl">
        <h1 className="hidden text-3xl font-medium font-bricolage text-slate100 dark:text-white md:block">{t("settings.workspace.title")}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate600 dark:text-slate200">{t("settings.workspace.description")}</p>

        {error ? <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {feedback ? <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</div> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${activeTab === key ? "bg-orange100 text-black" : "bg-white300 text-slate100 dark:bg-black100 dark:text-white"}`}>
              {t(label)}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tabLoading ? (
            <div className="rounded-3xl bg-white300 px-6 py-10 dark:bg-black100"><Spinner /></div>
          ) : null}

          {!tabLoading && activeTab === "monetize" ? (
            <div className="space-y-6">
              <Card title="Creator verification" description="Submit or track your creator verification request.">
                <div className="flex flex-wrap items-center gap-3"><StatusPill>{monetization.verification.status || "unsubmitted"}</StatusPill><span className="text-sm text-slate600 dark:text-slate200">Verified at: {formatDateTime(monetization.verification.verifiedAt)}</span></div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Legal name"><Input value={verificationForm.legalName} onChange={(e) => setVerificationForm((c) => ({ ...c, legalName: e.target.value }))} /></Field>
                  <Field label="Country"><Input value={verificationForm.country} onChange={(e) => setVerificationForm((c) => ({ ...c, country: e.target.value }))} /></Field>
                  <Field label="Document type"><Select value={verificationForm.documentType} onChange={(e) => setVerificationForm((c) => ({ ...c, documentType: e.target.value }))}><option value="id_card">ID card</option><option value="passport">Passport</option><option value="drivers_license">Driver's license</option><option value="business_document">Business document</option></Select></Field>
                  <Field label="Document URL"><Input type="url" value={verificationForm.documentUrl} onChange={(e) => setVerificationForm((c) => ({ ...c, documentUrl: e.target.value }))} /></Field>
                  <Field label="Social links" hint="Comma or new line separated"><Textarea value={verificationForm.socialLinks} onChange={(e) => setVerificationForm((c) => ({ ...c, socialLinks: e.target.value }))} /></Field>
                  <Field label="About"><Textarea value={verificationForm.about} onChange={(e) => setVerificationForm((c) => ({ ...c, about: e.target.value }))} /></Field>
                </div>
                <button type="button" onClick={handleSubmitVerification} disabled={busyAction === "verification"} className="mt-4 rounded-full bg-orange100 px-6 py-3 text-sm font-medium text-black disabled:opacity-60">Submit verification</button>
              </Card>

              <Card title="Wallet and payouts" description="Monitor balances, payout readiness, and recent ledger activity.">
                <div className="grid gap-4 md:grid-cols-3">{monetizationCards.map(([label, value]) => <SummaryCard key={label} label={label} value={value} />)}</div>
                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10">
                    <h3 className="font-semibold text-slate100 dark:text-white">Payout account</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="Account name"><Input value={payoutAccountForm.accountName} onChange={(e) => setPayoutAccountForm((c) => ({ ...c, accountName: e.target.value }))} /></Field>
                      <Field label="Account reference"><Input value={payoutAccountForm.accountReference} onChange={(e) => setPayoutAccountForm((c) => ({ ...c, accountReference: e.target.value }))} placeholder={monetization.account?.accountMask || "0123456789"} /></Field>
                      <Field label="Bank name"><Input value={payoutAccountForm.bankName} onChange={(e) => setPayoutAccountForm((c) => ({ ...c, bankName: e.target.value }))} /></Field>
                      <Field label="Bank code"><Input value={payoutAccountForm.bankCode} onChange={(e) => setPayoutAccountForm((c) => ({ ...c, bankCode: e.target.value }))} /></Field>
                    </div>
                    <button type="button" onClick={handleSavePayoutAccount} disabled={busyAction === "payout-account"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Save payout account</button>
                  </div>
                  <div className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10">
                    <h3 className="font-semibold text-slate100 dark:text-white">Request payout</h3>
                    <div className="mt-4 grid gap-4">
                      <Field label="Amount (minor units)"><Input type="number" value={payoutRequest.amount} onChange={(e) => setPayoutRequest((c) => ({ ...c, amount: e.target.value }))} /></Field>
                      <Field label="Notes"><Textarea value={payoutRequest.notes} onChange={(e) => setPayoutRequest((c) => ({ ...c, notes: e.target.value }))} /></Field>
                    </div>
                    <button type="button" onClick={handleRequestPayout} disabled={busyAction === "payout-request"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Request payout</button>
                    <div className="mt-4 space-y-3">{monetization.payouts.length ? monetization.payouts.map((payout) => <div key={payout.id} className="rounded-2xl bg-white px-4 py-3 dark:bg-[#121212]"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate100 dark:text-white">{formatMoney(payout.amount, payout.currency)}</span><StatusPill>{payout.status}</StatusPill></div><p className="mt-2 text-xs text-slate500 dark:text-slate300">{formatDateTime(payout.createdAt || payout.requestedAt)}</p></div>) : <EmptyState>No payout requests yet.</EmptyState>}</div>
                  </div>
                </div>
                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-semibold text-slate100 dark:text-white">Recent transactions</h3>
                    <div className="space-y-3">{monetization.transactions.length ? monetization.transactions.map((transaction) => <div key={transaction.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-slate100 dark:text-white">{transaction.description || transaction.type}</span><span className="text-sm text-slate600 dark:text-slate200">{formatMoney(transaction.amount, transaction.currency)}</span></div><p className="mt-1 text-xs text-slate500 dark:text-slate300">{transaction.type} · {transaction.status} · {formatDateTime(transaction.occurredAt)}</p></div>) : <EmptyState>No wallet transactions yet.</EmptyState>}</div>
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold text-slate100 dark:text-white">Recent fan tips</h3>
                    <div className="space-y-3">{monetization.tips.length ? monetization.tips.map((tip) => <div key={tip.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-slate100 dark:text-white">{profileName(tip.fan)}</span><span className="text-sm text-slate600 dark:text-slate200">{formatMoney(tip.amount, tip.currency)}</span></div>{tip.message ? <p className="mt-2 text-sm text-slate600 dark:text-slate200">{tip.message}</p> : null}</div>) : <EmptyState>No fan tips received yet.</EmptyState>}</div>
                  </div>
                </div>
              </Card>

              <Card title="Revenue sharing" description="Propose splits, respond to incoming requests, and settle active agreements.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Recipient user ID"><Input type="number" value={revenueShareForm.recipientId} onChange={(e) => setRevenueShareForm((c) => ({ ...c, recipientId: e.target.value }))} /></Field>
                  <Field label="Title"><Input value={revenueShareForm.title} onChange={(e) => setRevenueShareForm((c) => ({ ...c, title: e.target.value }))} /></Field>
                  <Field label="Source type"><Input value={revenueShareForm.sourceType} onChange={(e) => setRevenueShareForm((c) => ({ ...c, sourceType: e.target.value }))} /></Field>
                  <Field label="Share percentage"><Input type="number" value={revenueShareForm.sharePercentage} onChange={(e) => setRevenueShareForm((c) => ({ ...c, sharePercentage: e.target.value }))} /></Field>
                  <Field label="Currency"><Input value={revenueShareForm.currency} onChange={(e) => setRevenueShareForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))} /></Field>
                  <Field label="Notes"><Textarea value={revenueShareForm.notes} onChange={(e) => setRevenueShareForm((c) => ({ ...c, notes: e.target.value }))} /></Field>
                </div>
                <button type="button" onClick={handleCreateRevenueShare} disabled={busyAction === "revenue-share"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Create agreement</button>
                <div className="mt-5 space-y-4">{monetization.agreements.length ? monetization.agreements.map((agreement) => { const isOwner = agreement.owner?.id === user?.id; const isRecipient = agreement.recipient?.id === user?.id; return <div key={agreement.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="font-semibold text-slate100 dark:text-white">{agreement.title}</p><p className="mt-1 text-sm text-slate600 dark:text-slate200">{profileName(agreement.owner)} → {profileName(agreement.recipient)} · {agreement.sharePercentage}%</p><p className="mt-1 text-xs text-slate500 dark:text-slate300">{agreement.sourceType} · {agreement.status}</p></div><StatusPill>{agreement.status}</StatusPill></div>{agreement.status === "pending" && isRecipient ? <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => handleRevenueShareAction(agreement.id, "accept")} className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Accept</button><button type="button" onClick={() => handleRevenueShareAction(agreement.id, "reject")} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Reject</button></div> : null}{agreement.status === "pending" && isOwner ? <button type="button" onClick={() => handleRevenueShareAction(agreement.id, "cancel")} className="mt-4 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Cancel</button> : null}{agreement.status === "active" && isOwner ? <div className="mt-4 flex flex-col gap-3 md:flex-row"><Input type="number" value={settlementDrafts[agreement.id] || ""} onChange={(e) => setSettlementDrafts((c) => ({ ...c, [agreement.id]: e.target.value }))} placeholder="Gross amount (minor units)" /><button type="button" onClick={() => handleCreateSettlement(agreement.id)} className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Settle share</button></div> : null}</div>; }) : <EmptyState>No revenue share agreements yet.</EmptyState>}</div>
              </Card>
            </div>
          ) : null}

          {!tabLoading && activeTab === "commerce" ? (
            <div className="space-y-6">
              <Card title="Brand campaigns" description="Create brand campaigns and shortlist matching creators.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Campaign title"><Input value={campaignForm.title} onChange={(e) => setCampaignForm((c) => ({ ...c, title: e.target.value }))} /></Field>
                  <Field label="Objective"><Input value={campaignForm.objective} onChange={(e) => setCampaignForm((c) => ({ ...c, objective: e.target.value }))} /></Field>
                  <Field label="Status"><Select value={campaignForm.status} onChange={(e) => setCampaignForm((c) => ({ ...c, status: e.target.value }))}><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="closed">Closed</option></Select></Field>
                  <Field label="Budget amount (minor units)"><Input type="number" value={campaignForm.budgetAmount} onChange={(e) => setCampaignForm((c) => ({ ...c, budgetAmount: e.target.value }))} /></Field>
                  <Field label="Currency"><Input value={campaignForm.currency} onChange={(e) => setCampaignForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))} /></Field>
                  <Field label="Minimum subscribers"><Input type="number" value={campaignForm.minSubscribers} onChange={(e) => setCampaignForm((c) => ({ ...c, minSubscribers: e.target.value }))} /></Field>
                  <Field label="Deliverables" hint="Comma or new line separated"><Textarea value={campaignForm.deliverables} onChange={(e) => setCampaignForm((c) => ({ ...c, deliverables: e.target.value }))} /></Field>
                </div>
                <button type="button" onClick={handleCreateCampaign} disabled={busyAction === "campaign"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Create campaign</button>
                <div className="mt-5 space-y-4">{commerce.campaigns.length ? commerce.campaigns.map((campaign) => <div key={campaign.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="font-semibold text-slate100 dark:text-white">{campaign.title}</p><p className="mt-1 text-sm text-slate600 dark:text-slate200">{campaign.objective} · {formatMoney(campaign.budgetAmount, campaign.currency)}</p></div><StatusPill>{campaign.status}</StatusPill></div><button type="button" onClick={() => handleLoadMatches(campaign.id)} className="mt-4 rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Load matches</button>{commerce.campaignMatches[campaign.id]?.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{commerce.campaignMatches[campaign.id].slice(0, 4).map((entry) => <div key={entry.profile.id} className="rounded-2xl bg-white px-4 py-3 dark:bg-[#121212]"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-slate100 dark:text-white">{profileName(entry.profile)}</p><p className="text-xs text-slate500 dark:text-slate300">{entry.metrics.publishedVideos} videos · {entry.metrics.publishedViews} views</p></div><button type="button" onClick={() => setSponsorshipForm((c) => ({ ...c, recipientId: String(entry.profile.id), brandCampaignId: String(campaign.id) }))} className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-slate100 dark:border-white/10 dark:text-white">Use creator</button></div></div>)}</div> : null}</div>) : <EmptyState>No brand campaigns yet.</EmptyState>}</div>
              </Card>

              <Card title="Talent discovery" description="Search for verified creators you can pitch or shortlist for campaigns.">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Field label="Search"><Input value={discoveryFilters.q} onChange={(e) => setDiscoveryFilters((c) => ({ ...c, q: e.target.value }))} /></Field>
                  <Field label="Category ID"><Input value={discoveryFilters.categoryId} onChange={(e) => setDiscoveryFilters((c) => ({ ...c, categoryId: e.target.value }))} /></Field>
                  <Field label="Minimum subscribers"><Input type="number" value={discoveryFilters.minSubscribers} onChange={(e) => setDiscoveryFilters((c) => ({ ...c, minSubscribers: e.target.value }))} /></Field>
                  <Field label="Active plans only"><Select value={discoveryFilters.hasActivePlans ? "yes" : "no"} onChange={(e) => setDiscoveryFilters((c) => ({ ...c, hasActivePlans: e.target.value === "yes" }))}><option value="yes">Yes</option><option value="no">No</option></Select></Field>
                </div>
                <button type="button" onClick={() => runAction("discovery", refreshDiscovery)} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black">Refresh discovery</button>
                <div className="mt-5 grid gap-3 md:grid-cols-2">{commerce.discovery.length ? commerce.discovery.map((entry) => <div key={entry.profile.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate100 dark:text-white">{profileName(entry.profile)}</p><p className="mt-1 text-sm text-slate600 dark:text-slate200">{entry.metrics.publishedVideos} videos · {entry.metrics.publishedViews} views</p></div><button type="button" onClick={() => { setRevenueShareForm((c) => ({ ...c, recipientId: String(entry.profile.id) })); setSponsorshipForm((c) => ({ ...c, recipientId: String(entry.profile.id) })); }} className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-slate100 dark:border-white/10 dark:text-white">Use creator</button></div></div>) : <EmptyState>No discovery matches yet.</EmptyState>}</div>
              </Card>

              <Card title="Sponsorship proposals" description="Send proposals from your brand workspace and respond to your inbox.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Recipient user ID"><Input type="number" value={sponsorshipForm.recipientId} onChange={(e) => setSponsorshipForm((c) => ({ ...c, recipientId: e.target.value }))} /></Field>
                  <Field label="Campaign ID"><Input type="number" value={sponsorshipForm.brandCampaignId} onChange={(e) => setSponsorshipForm((c) => ({ ...c, brandCampaignId: e.target.value }))} placeholder="Optional" /></Field>
                  <Field label="Proposal title"><Input value={sponsorshipForm.title} onChange={(e) => setSponsorshipForm((c) => ({ ...c, title: e.target.value }))} /></Field>
                  <Field label="Fee amount (minor units)"><Input type="number" value={sponsorshipForm.feeAmount} onChange={(e) => setSponsorshipForm((c) => ({ ...c, feeAmount: e.target.value }))} /></Field>
                  <Field label="Currency"><Input value={sponsorshipForm.currency} onChange={(e) => setSponsorshipForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))} /></Field>
                  <Field label="Deliverables"><Textarea value={sponsorshipForm.deliverables} onChange={(e) => setSponsorshipForm((c) => ({ ...c, deliverables: e.target.value }))} /></Field>
                </div>
                <Field label="Brief"><Textarea value={sponsorshipForm.brief} onChange={(e) => setSponsorshipForm((c) => ({ ...c, brief: e.target.value }))} /></Field>
                <button type="button" onClick={handleCreateSponsorship} disabled={busyAction === "sponsorship"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Send proposal</button>
                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  <div><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Sent</h3><div className="space-y-3">{commerce.proposalsSent.length ? commerce.proposalsSent.map((proposal) => <div key={proposal.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate100 dark:text-white">{proposal.title}</span><StatusPill>{proposal.status}</StatusPill></div><p className="mt-1 text-sm text-slate600 dark:text-slate200">To {profileName(proposal.recipient)} · {formatMoney(proposal.feeAmount, proposal.currency)}</p>{proposal.status === "pending" ? <button type="button" onClick={() => handleProposalAction(proposal.id, "cancel")} className="mt-3 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Cancel</button> : null}</div>) : <EmptyState>No proposals sent yet.</EmptyState>}</div></div>
                  <div><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Inbox</h3><div className="space-y-3">{commerce.proposalsInbox.length ? commerce.proposalsInbox.map((proposal) => <div key={proposal.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate100 dark:text-white">{proposal.title}</span><StatusPill>{proposal.status}</StatusPill></div><p className="mt-1 text-sm text-slate600 dark:text-slate200">From {profileName(proposal.sender)} · {formatMoney(proposal.feeAmount, proposal.currency)}</p>{proposal.status === "pending" ? <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => handleProposalAction(proposal.id, "accept")} className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Accept</button><button type="button" onClick={() => handleProposalAction(proposal.id, "reject")} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Reject</button></div> : null}</div>) : <EmptyState>No incoming proposals yet.</EmptyState>}</div></div>
                </div>
              </Card>

              <Card title="Merch store" description="Launch creator merch and manage orders from one place.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Product name"><Input value={productForm.name} onChange={(e) => setProductForm((c) => ({ ...c, name: e.target.value }))} /></Field>
                  <Field label="Price amount (minor units)"><Input type="number" value={productForm.priceAmount} onChange={(e) => setProductForm((c) => ({ ...c, priceAmount: e.target.value }))} /></Field>
                  <Field label="Currency"><Input value={productForm.currency} onChange={(e) => setProductForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))} /></Field>
                  <Field label="Inventory count"><Input type="number" value={productForm.inventoryCount} onChange={(e) => setProductForm((c) => ({ ...c, inventoryCount: e.target.value }))} /></Field>
                  <Field label="Images" hint="Comma or new line separated"><Textarea value={productForm.images} onChange={(e) => setProductForm((c) => ({ ...c, images: e.target.value }))} /></Field>
                  <Field label="Description"><Textarea value={productForm.description} onChange={(e) => setProductForm((c) => ({ ...c, description: e.target.value }))} /></Field>
                </div>
                <button type="button" onClick={handleCreateProduct} disabled={busyAction === "product"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Create merch product</button>
                <div className="mt-5 grid gap-6 lg:grid-cols-3">
                  <div><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Products</h3><div className="space-y-3">{commerce.products.length ? commerce.products.map((product) => <div key={product.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate100 dark:text-white">{product.name}</span><StatusPill>{product.status}</StatusPill></div><p className="mt-1 text-sm text-slate600 dark:text-slate200">{formatMoney(product.priceAmount, product.currency)} · Stock {product.inventoryCount}</p></div>) : <EmptyState>No merch products yet.</EmptyState>}</div></div>
                  <div><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Orders received</h3><div className="space-y-3">{commerce.receivedOrders.length ? commerce.receivedOrders.map((order) => <div key={order.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate100 dark:text-white">{order.product?.name || `Order #${order.id}`}</span><StatusPill>{order.status}</StatusPill></div><p className="mt-1 text-sm text-slate600 dark:text-slate200">Buyer: {profileName(order.buyer)} · {formatMoney(order.totalAmount, order.currency)}</p>{order.status === "paid" ? <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => handleOrderAction(order.id, "fulfill")} className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Fulfill</button><button type="button" onClick={() => handleOrderAction(order.id, "cancel")} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600">Cancel</button></div> : null}</div>) : <EmptyState>No received merch orders yet.</EmptyState>}</div></div>
                  <div><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Orders you placed</h3><div className="space-y-3">{commerce.myOrders.length ? commerce.myOrders.map((order) => <div key={order.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate100 dark:text-white">{order.product?.name || `Order #${order.id}`}</span><StatusPill>{order.status}</StatusPill></div><p className="mt-1 text-sm text-slate600 dark:text-slate200">Creator: {profileName(order.creator)} · {formatMoney(order.totalAmount, order.currency)}</p></div>) : <EmptyState>No merch orders placed yet.</EmptyState>}</div></div>
                </div>
              </Card>
            </div>
          ) : null}

          {!tabLoading && activeTab === "growth" ? (
            <div className="space-y-6">
              <Card title="Creator academy" description="Enroll in published courses and mark lessons complete.">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Courses</h3><div className="space-y-3">{growth.courses.length ? growth.courses.map((course) => <div key={course.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10"><p className="font-semibold text-slate100 dark:text-white">{course.title}</p><p className="mt-1 text-sm text-slate600 dark:text-slate200">{course.difficulty} · {course.lessonsCount} lessons · {course.estimatedMinutes} min</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => handleOpenCourse(course.id)} className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-slate100 dark:border-white/10 dark:text-white">Open</button><button type="button" onClick={() => handleEnrollCourse(course.id)} className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Enroll</button></div></div>) : <EmptyState>No published academy courses yet.</EmptyState>}</div></div>
                  <div><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Current course</h3>{growth.selectedCourse ? <div className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10"><p className="font-semibold text-slate100 dark:text-white">{growth.selectedCourse.title}</p><p className="mt-1 text-sm text-slate600 dark:text-slate200">{growth.selectedCourse.summary}</p><div className="mt-4 space-y-3">{growth.selectedCourse.lessons?.length ? growth.selectedCourse.lessons.map((lesson) => <div key={lesson.id} className="rounded-2xl bg-white px-4 py-3 dark:bg-[#121212]"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-slate100 dark:text-white">{lesson.title}</p><p className="text-xs text-slate500 dark:text-slate300">{lesson.durationMinutes || 0} min</p></div><button type="button" onClick={() => handleCompleteLesson(lesson.id)} className="rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Complete</button></div></div>) : <EmptyState>No lessons loaded.</EmptyState>}</div></div> : <EmptyState>Open a course to inspect lessons.</EmptyState>}</div>
                </div>
                <div className="mt-5"><h3 className="mb-3 font-semibold text-slate100 dark:text-white">Your learning</h3><div className="space-y-3">{growth.enrollments.length ? growth.enrollments.map((enrollment) => <div key={enrollment.id} className="rounded-2xl border border-black/8 px-4 py-3 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="font-medium text-slate100 dark:text-white">{enrollment.course?.title}</span><span className="text-sm text-slate600 dark:text-slate200">{enrollment.progressPercent}%</span></div><p className="mt-1 text-xs text-slate500 dark:text-slate300">{enrollment.completedLessons}/{enrollment.totalLessons} lessons complete</p></div>) : <EmptyState>No enrollments yet.</EmptyState>}</div></div>
              </Card>

              <Card title="AI editing studio" description="Create draft AI edit projects and generate outputs from source video or upload IDs.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Source video ID"><Input type="number" value={aiProjectForm.sourceVideoId} onChange={(e) => setAiProjectForm((c) => ({ ...c, sourceVideoId: e.target.value }))} /></Field>
                  <Field label="Source upload ID"><Input type="number" value={aiProjectForm.sourceUploadId} onChange={(e) => setAiProjectForm((c) => ({ ...c, sourceUploadId: e.target.value }))} /></Field>
                  <Field label="Project title"><Input value={aiProjectForm.title} onChange={(e) => setAiProjectForm((c) => ({ ...c, title: e.target.value }))} /></Field>
                  <Field label="Operations"><Textarea value={aiProjectForm.operations} onChange={(e) => setAiProjectForm((c) => ({ ...c, operations: e.target.value }))} /></Field>
                </div>
                <button type="button" onClick={handleCreateAiProject} disabled={busyAction === "ai-project"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Create AI project</button>
                <div className="mt-5 space-y-3">{growth.aiProjects.length ? growth.aiProjects.map((project) => <div key={project.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-slate100 dark:text-white">{project.title || `Project #${project.id}`}</p><p className="mt-1 text-sm text-slate600 dark:text-slate200">{(project.operations || []).join(", ") || "No operations"}</p></div><StatusPill>{project.status}</StatusPill></div>{project.status === "draft" ? <button type="button" onClick={() => handleGenerateAiProject(project.id)} className="mt-4 rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Generate</button> : null}{project.output?.seed ? <p className="mt-3 text-xs text-slate500 dark:text-slate300">Output seed: {project.output.seed}</p> : null}</div>) : <EmptyState>No AI studio projects yet.</EmptyState>}</div>
              </Card>

              <Card title="Offline upload queue" description="Track queued uploads and mark synced items when the client catches up.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Client reference"><Input value={offlineForm.clientReference} onChange={(e) => setOfflineForm((c) => ({ ...c, clientReference: e.target.value }))} /></Field>
                  <Field label="Type"><Select value={offlineForm.type} onChange={(e) => setOfflineForm((c) => ({ ...c, type: e.target.value }))}><option value="video">Video</option><option value="image">Image</option><option value="gif">GIF</option></Select></Field>
                  <Field label="Title"><Input value={offlineForm.title} onChange={(e) => setOfflineForm((c) => ({ ...c, title: e.target.value }))} /></Field>
                  <Field label="Status"><Select value={offlineForm.status} onChange={(e) => setOfflineForm((c) => ({ ...c, status: e.target.value }))}><option value="queued">Queued</option><option value="uploading">Uploading</option><option value="synced">Synced</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option></Select></Field>
                  <Field label="Upload ID"><Input type="number" value={offlineForm.uploadId} onChange={(e) => setOfflineForm((c) => ({ ...c, uploadId: e.target.value }))} /></Field>
                  <Field label="Video ID"><Input type="number" value={offlineForm.videoId} onChange={(e) => setOfflineForm((c) => ({ ...c, videoId: e.target.value }))} /></Field>
                  <Field label="Metadata note"><Textarea value={offlineForm.metadata} onChange={(e) => setOfflineForm((c) => ({ ...c, metadata: e.target.value }))} /></Field>
                </div>
                <button type="button" onClick={handleSaveOfflineItem} disabled={busyAction === "offline-item"} className="mt-4 rounded-full bg-orange100 px-5 py-3 text-sm font-medium text-black disabled:opacity-60">Save offline item</button>
                <div className="mt-5 space-y-3">{growth.offlineItems.length ? growth.offlineItems.map((item) => <div key={item.id} className="rounded-2xl border border-black/8 px-4 py-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-slate100 dark:text-white">{item.title || item.clientReference}</p><p className="mt-1 text-sm text-slate600 dark:text-slate200">{item.type} · last sync {formatDateTime(item.lastSyncedAt)}</p></div><StatusPill>{item.status}</StatusPill></div>{item.status !== "synced" ? <button type="button" onClick={() => handleSyncOfflineItem(item.id, item.videoId)} className="mt-4 rounded-full bg-orange100 px-4 py-2 text-sm font-medium text-black">Mark synced</button> : null}</div>) : <EmptyState>No offline upload items yet.</EmptyState>}</div>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}