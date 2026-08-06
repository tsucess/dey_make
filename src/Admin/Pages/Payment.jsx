import Header from "../components/Payment/Header";
import Menu from "../components/Payment/Menu";
import PaymentTable from "../components/Payment/PaymentTable";
import Stats from "../components/SuspendedAcoount/Stats";

const stats = [
  {
    title: "Total Payments",
    value: "124.8M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Successful Payments",
    value: "4,382",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Total Payouts",
    value: "98.2M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Pending Payouts",
    value: "12.5M",
    sub: "12.5% vs last 7 days",
    hasArrow: true,
  },
  {
    title: "Failed Payments",
    value: "66",
    sub: "5.2% vs last 7 days",
    hasArrow: true,
  },
];

function Payment() {
  return (
    <div className="space-y-8">
      <Header />
      <Stats stats={stats} />
      <Menu />
      <PaymentTable />
    </div>
  );
}

export default Payment;
