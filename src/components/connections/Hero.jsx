import Creators from "./Creators";
import Story from "./Story";

function Hero({ stories, creators, onViewStory, onToggleConnect }) {
  return (
    <section className="flex items-center justify-between gap-10">
      <Story stories={stories} onViewStory={onViewStory} />
      <Creators creators={creators} onToggleConnect={onToggleConnect} />
    </section>
  );
}

export default Hero;
