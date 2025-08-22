/**
 * Builder class for constructing formatted response strings
 */
export class ResponseBuilder {
  private sections: string[] = [];

  /**
   * Add a title section
   */
  addTitle(title: string): ResponseBuilder {
    this.sections.push(title);
    return this;
  }

  /**
   * Add a key-value pair
   */
  addField(key: string, value: string): ResponseBuilder {
    this.sections.push(`${key}: ${value}`);
    return this;
  }

  /**
   * Add a section with a header and content
   */
  addSection(header: string, content: string): ResponseBuilder {
    this.sections.push(`\n${header}:\n${content}`);
    return this;
  }

  /**
   * Add a simple section without header
   */
  addContent(content: string): ResponseBuilder {
    this.sections.push(`\n${content}`);
    return this;
  }

  /**
   * Add a list of items with numbering
   */
  addNumberedList(header: string, items: string[]): ResponseBuilder {
    if (items.length === 0) {
      return this;
    }

    let listContent = `\n${header}:\n`;
    items.forEach((item, index) => {
      listContent += `${index + 1}. ${item}\n`;
    });

    this.sections.push(listContent.trimEnd());
    return this;
  }

  /**
   * Add a list of items with bullet points
   */
  addBulletList(header: string, items: string[]): ResponseBuilder {
    if (items.length === 0) {
      return this;
    }

    let listContent = `\n${header}:\n`;
    items.forEach(item => {
      listContent += `- ${item}\n`;
    });

    this.sections.push(listContent.trimEnd());
    return this;
  }

  /**
   * Add a line break
   */
  addLineBreak(): ResponseBuilder {
    this.sections.push("");
    return this;
  }

  /**
   * Add raw text without formatting
   */
  addRaw(text: string): ResponseBuilder {
    this.sections.push(text);
    return this;
  }

  /**
   * Add multiple fields at once
   */
  addFields(fields: Record<string, string>): ResponseBuilder {
    Object.entries(fields).forEach(([key, value]) => {
      this.addField(key, value);
    });
    return this;
  }

  /**
   * Add a conditional field (only if value is truthy)
   */
  addFieldIf(condition: boolean, key: string, value: string): ResponseBuilder {
    if (condition) {
      this.addField(key, value);
    }
    return this;
  }

  /**
   * Add a conditional section (only if content is truthy)
   */
  addSectionIf(
    condition: boolean,
    header: string,
    content: string
  ): ResponseBuilder {
    if (condition) {
      this.addSection(header, content);
    }
    return this;
  }

  /**
   * Build the final string
   */
  build(maxLength?: number): string {
    const result = this.sections.join("\n");

    if (maxLength && result.length > maxLength) {
      return result.substring(0, maxLength);
    }

    return result;
  }

  /**
   * Clear all sections and start fresh
   */
  clear(): ResponseBuilder {
    this.sections = [];
    return this;
  }

  /**
   * Get the current length of the built string
   */
  getLength(): number {
    return this.build().length;
  }
}
