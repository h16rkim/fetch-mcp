import { ConfluenceExportView } from "./ConfluenceExportView.js";

export class ConfluenceBody {
  private _exportView?: ConfluenceExportView;

  constructor(data: { export_view?: { value?: string } }) {
    this._exportView = data.export_view ? new ConfluenceExportView(data.export_view) : undefined;
  }

  get data(): { export_view?: { value?: string } } {
    return {
      export_view: this._exportView?.data
    };
  }

  get exportView(): ConfluenceExportView | undefined {
    return this._exportView;
  }

  get htmlContent(): string {
    return this._exportView?.htmlContent || "No content";
  }

  get hasContent(): boolean {
    return Boolean(this._exportView?.hasContent);
  }

  get contentLength(): number {
    return this._exportView?.contentLength || 0;
  }

  get shortContent(): string {
    return this._exportView?.shortContent || "No content";
  }
}
