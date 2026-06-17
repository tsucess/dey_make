import Creators from "./Creators";
import Story from "./Story";

function Hero() {
  return (
    <section className="flex items-center justify-between gap-10">
      <Story />
      <Creators />
    </section>
  );
}

export default Hero;
