export default class TranslationProgress {
  static progress: number = 0;
  static title: string = "";
  static active: boolean = false;
  static nb_paragraph_total: number = 0;
  static nb_paragraph_done: number = 0;
  static completed: boolean = false;

  static toJson = () => {
    return {
      progress: this.progress,
      title: this.title,
      active: this.active,
      nb_paragraph_total: this.nb_paragraph_total,
      nb_paragraph_done: this.nb_paragraph_done,
      completed: this.completed,
    };
  }

  static reset = (): void => {
    this.progress = 0;
    this.title = "";
    this.active = false;
    this.nb_paragraph_done = 0;
    this.nb_paragraph_total = 0;
    this.completed = false;
  }
}
