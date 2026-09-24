import { useMemo, useState } from "react";
import { site } from "./data/site.js";
import { EditProvider, useEdit } from "./components/edit/EditContext.jsx";

import Intro from "./components/Intro.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Hero from "./components/Hero.jsx";
import Section from "./components/Section.jsx";
import Timeline from "./components/Timeline.jsx";
import Lightbox from "./components/Lightbox.jsx";
import Footer from "./components/Footer.jsx";
import EditToggle from "./components/edit/EditToggle.jsx";
import AddGroup from "./components/edit/AddGroup.jsx";

import { MusicProvider } from "./components/music/MusicProvider.jsx";

function AppInner() {
  const { features } = site;
  const { content, flatPhotos, editing } = useEdit();
  const groups = content.groups;

  // Lightbox index within the flattened, whole-gallery photo list.
  const [openIndex, setOpenIndex] = useState(null);

  // Where each group starts in the flattened list (so a tile click maps to the
  // right global index for next/previous).
  const startIndices = useMemo(() => {
    let running = 0;
    return groups.map((g) => {
      const start = running;
      running += g.photos.length;
      return start;
    });
  }, [groups]);

  // Drop the timeline roughly in the middle of the sections.
  const timelineAt = Math.ceil(groups.length / 2);

  const tree = (
    <>
      {features.intro ? <Intro /> : null}
      {features.scrollProgress ? <ScrollProgress /> : null}

      <Hero />

      <main>
        {groups.map((group, i) => (
          <div key={group.id}>
            <Section group={group} startIndex={startIndices[i]} onOpen={setOpenIndex} index={i} />
            {features.timeline && i === timelineAt - 1 ? <Timeline /> : null}
          </div>
        ))}
        {editing ? <AddGroup /> : null}
      </main>

      <Footer />

      <Lightbox
        photos={flatPhotos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />

      {features.edit ? <EditToggle /> : null}
    </>
  );

  return features.music.enabled ? <MusicProvider>{tree}</MusicProvider> : tree;
}

export default function App() {
  return (
    <EditProvider>
      <AppInner />
    </EditProvider>
  );
}
