import { Composition, Folder } from "remotion";
import { FailingBusiness } from "./FailingBusiness";
import { episodeSchema } from "./episodes/schema";
import { VIDEO } from "./theme";
import episode1 from "./episodes/episode1.json";
import episode1Part2 from "./episodes/episode1-part2.json";

/**
 * To add an episode: drop a new JSON file in src/episodes/, import it here,
 * and add a <Composition>. Validation errors from the schema show up immediately.
 */
const EPISODES = [
  { id: "FailingBusiness", data: episode1 },
  { id: "FailingBusiness-Part2", data: episode1Part2 },
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
