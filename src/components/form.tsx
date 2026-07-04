"use client";

import ProjectForm from "@/components/forms/ProjectForm";
// import ArticleForm from "@/components/forms/ArticleForm";

/**
 * Demo screen wiring the two example forms together:
 *   - ProjectForm: multi-client
 *   - ArticleForm: single-client
 */
const Form = () => {
  return (
    <div className="w-full flex flex-wrap items-start justify-center gap-6 p-6">
      <ProjectForm />
      {/* <ArticleForm /> */}
    </div>
  );
};

export default Form;
