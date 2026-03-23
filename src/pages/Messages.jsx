const avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80";

const inboxMessages = [
  { id: 1, name: "Jason Eton", status: "Sent yesterday" },
  { id: 2, name: "Jason Eton", status: "Active", online: true, unread: 1 },
  { id: 3, name: "Jason Eton", status: "Sent 2m ago" },
];

const suggestedMessages = [
  { id: 4, name: "Jason Eton", status: "Active", online: true },
  { id: 5, name: "Jason Eton", status: "Active", online: true },
];

function MessageRow({ name, status, online, unread, isLast }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-[1.75rem] bg-[#F5F5F5] px-4 py-4 dark:bg-black100 md:rounded-none md:bg-transparent md:px-0 md:py-6 ${
        !isLast ? "md:border-b md:border-slate200 md:dark:border-slate300" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative">
          <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
          {online && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green100 dark:border-black100" />}
        </div>
        <div>
          <p className="text-lbase font-medium font-inter text-black dark:text-white">{name}</p>
          <p className="mt-1 text-sm text-black dark:text-slate200">{status}</p>
        </div>
      </div>
      {unread ? <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red200 text-sm font-medium text-white">{unread}</span> : null}
    </div>
  );
}

function MessageSection({ title, items, hideTitleOnMobile = false }) {
  return (
    <section className="space-y-6">
      <h2 className=" text-lg md:text-2xl font-medium font-bricolage text-black dark:text-white">{title}</h2>
      <div className="rounded-3xl bg-white300 px-6 py-5 dark:bg-black100 md:px-10 md:py-8">
        {items.map((item, index) => <MessageRow key={item.id} {...item} isLast={index === items.length - 1} />)}
      </div>
    </section>
  );
}

export default function Messages() {
  return (
    <div className="min-h-full bg-white px-4 pb-24 pt-2 dark:bg-slate100 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <MessageSection title="Inbox" items={inboxMessages} hideTitleOnMobile />
        <MessageSection title="Suggested" items={suggestedMessages} />
      </div>
    </div>
  );
}