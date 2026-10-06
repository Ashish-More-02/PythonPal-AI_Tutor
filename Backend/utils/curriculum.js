// Guided learning content, static on purpose: we're the only authors, so files
// beat a DB collection. Two kinds share one shape ({ id, title, description,
// starterCode, steps }) and the same open → step → check loop:
//   lessons  — Python Basics, one concept each, done in order
//   projects — one real program built across the steps
const { lessons } = require("./lessons");
const { projects } = require("./projects");

// Ids share one namespace because the URL (/learn/:itemId) and progress rows
// don't carry the kind. Fail at boot rather than open the wrong item later.
const allIds = [...lessons, ...projects].map((item) => item.id); // created a array of all ids in lessons and projects

// check if all ids are unique or not, or else throw error, as ids are "string" rather than "number or slug"
if (new Set(allIds).size !== allIds.length) {
  throw new Error("curriculum: lesson and project ids must be unique");
}

// A slides lesson has no exercises; reading it is its one and only "step".
const READ_STEP_ID = "read";

const isSlides = (item) => item.format === "slides";

// The step ids that make an item complete, whatever its format => this function is used to get all step ids of a lession/item
const stepIdsOf = (item) =>
  isSlides(item) ? [READ_STEP_ID] : item.steps.map((s) => s.id);

// Returns { item, kind } or null. => frontend only send in item id , but we don't konw if it belongs to lesson or project, so this function searches both lists and return the correct data.
const getItem = (itemId) => {
  const lesson = lessons.find((l) => l.id === itemId);
  if (lesson) {
    return { item: lesson, kind: "lesson" };
  }

  const project = projects.find((p) => p.id === itemId);
  if (project) {
    return { item: project, kind: "project" };
  }

  return null;
};

// What the browser is allowed to see: everything except the checker's goals.
// Lessons also point at the next lesson, so finishing one leads straight on.
const toPublicItem = (item, kind) => {
  const lessonIndex = kind === "lesson" ? lessons.indexOf(item) : -1;
  const nextLesson = lessonIndex !== -1 ? lessons[lessonIndex + 1] : null;
  return {
    id: item.id,
    kind,
    title: item.title,
    description: item.description,
    format: isSlides(item) ? "slides" : "exercises",
    // Lesson 0 is the "Why Python?" intro, so the array index is the lesson number.
    lessonNumber: lessonIndex !== -1 ? lessonIndex : null,
    next: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
    ...(isSlides(item)
      ? { slides: item.slides }
      : { steps: item.steps.map(({ goal, ...oneStepDetails }) => oneStepDetails) }),
  };
};

module.exports = {
  lessons,
  projects,
  getItem,
  toPublicItem,
  isSlides,
  stepIdsOf,
  READ_STEP_ID,
};
