class TranslationProgress {
  progress: number = 0;
  title: string = "";
  active: boolean = false;
  nb_paragraph: number = 0;

  toJson = () => {
    return {
      progress: this.progress,
      title: this.title,
      active: this.active,
        nb_paragraph: this.nb_paragraph
    };
  }
}

export let translation: TranslationProgress = new TranslationProgress();
