import { Composition, Folder } from "remotion";
import { FailingBusiness } from "./FailingBusiness";
import { episodeSchema } from "./episodes/schema";
import { VIDEO } from "./theme";
import episode1 from "./episodes/episode1.json";
import episode1Part2 from "./episodes/episode1-part2.json";
import ep02 from "./episodes/ep02-midnight-ramen-path-a.json";
import ep03 from "./episodes/ep03-midnight-ramen-path-a2.json";
import ep04 from "./episodes/ep04-midnight-ramen-path-a3.json";

/**
 * To add an episode: drop a new JSON file in src/episodes/, import it here,
 * and add a <Composition>. Validation errors from the schema show up immediately.
 */
const EPISODES = [
  { id: "FailingBusiness", data: episode1 },
  { id: "FailingBusiness-Part2", data: episode1Part2 },
  { id: "FailingBusiness-Ep02", data: ep02 },
  { id: "FailingBusiness-Part3", data: ep03 },
  { id: "FailingBusiness-Part4", data: ep04 },
];

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Save-This-Business">
      {EPISODES.map(({ id, data }) => (
        <Composition
          key={id}
          id={id}
          component={FailingBusiness}
          schema={episodeSchema}
          defaultProps={episodeSchema.parse(data)}
          durationInFrames={VIDEO.durationInFrames}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
      ))}
    </Folder>
  );
};
