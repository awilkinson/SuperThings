import { AddTodoParams, AddProjectParams, UpdateTodoJSONParams, UpdateProjectJSONParams, AddItemsToProjectParams } from '../types/things.js';
import { executeAppleScriptFile } from './applescript.js';

/**
 * Unified builder for Things 3 items using AppleScript (SILENT MODE)
 * Uses AppleScript instead of URL schemes to avoid activating/focusing Things
 */
export class ThingsJSONBuilder {
  /**
   * Create a to-do item using AppleScript
   */
  async createTodo(params: AddTodoParams): Promise<string> {
    const args = this.buildTodoArgs(params);
    await executeAppleScriptFile('create-todo', args);
    return `Created to-do: "${params.title}"`;
  }

  /**
   * Create a project using AppleScript
   */
  async createProject(params: AddProjectParams): Promise<string> {
    const args = this.buildProjectArgs(params);
    const projectId = await executeAppleScriptFile('create-project', args);

    // If there are items, create them as todos in the project
    if (params.items && params.items.length > 0) {
      let itemCount = 0;
      for (const item of params.items) {
        if (item.type === 'todo') {
          const todoArgs = this.buildTodoArgs({
            title: item.title,
            notes: item.notes,
            when: item.when,
            deadline: item.deadline,
            tags: item.tags,
            list_id: projectId,
            completed: item.completed,
            canceled: item.canceled,
            checklist_items: item.checklist?.map(c => c.title)
          });
          await executeAppleScriptFile('create-todo', todoArgs);
          itemCount++;
        }
        // Note: Headings can only be created during project creation via URL scheme
        // AppleScript doesn't support adding headings, so we skip them with a note
      }
      return `Created project: "${params.title}" with ${itemCount} todo(s)`;
    }

    return `Created project: "${params.title}"`;
  }

  /**
   * Update an existing to-do using AppleScript
   */
  async updateTodo(params: UpdateTodoJSONParams): Promise<string> {
    const args = this.buildUpdateTodoArgs(params);
    await executeAppleScriptFile('update-todo', args);
    return `Updated to-do: "${params.title || params.id}"`;
  }

  /**
   * Update an existing project using AppleScript
   */
  async updateProject(params: UpdateProjectJSONParams): Promise<string> {
    const args = this.buildUpdateProjectArgs(params);
    await executeAppleScriptFile('update-project', args);
    return `Updated project: "${params.title || params.id}"`;
  }

  /**
   * Add items to an existing project
   */
  async addItemsToProject(params: AddItemsToProjectParams): Promise<string> {
    const results = {
      todos: 0,
      headings: 0,
      errors: [] as string[]
    };

    for (const item of params.items) {
      if (item.type === 'heading') {
        results.headings++;
        continue;
      }

      try {
        const todoArgs = this.buildTodoArgs({
          title: item.title,
          notes: item.notes,
          when: item.when,
          deadline: item.deadline,
          tags: item.tags,
          list_id: params.id,
          completed: item.completed,
          canceled: item.canceled,
          checklist_items: item.checklist?.map(c => c.title)
        });
        await executeAppleScriptFile('create-todo', todoArgs);
        results.todos++;
      } catch {
        results.errors.push(`"${item.title}"`);
      }
    }

    let message = '';

    if (results.todos > 0) {
      message = `Added ${results.todos} todo(s) to project`;
    }

    if (results.headings > 0) {
      if (message) message += '\n';
      message += `Skipped ${results.headings} heading(s) - headings cannot be added via AppleScript`;
    }

    if (results.errors.length > 0) {
      if (message) message += '\n';
      message += `Failed to add: ${results.errors.join(', ')}`;
    }

    if (!message) {
      message = 'No items were processed';
    }

    return message;
  }

  /**
   * Build arguments array for create-todo AppleScript
   * Order: title, notes, when, deadline, tags, list, listId, heading, completed, canceled, checklistItems
   */
  private buildTodoArgs(params: AddTodoParams): string[] {
    return [
      params.title || '',
      params.notes || '',
      params.when || '',
      params.deadline || '',
      params.tags?.join(',') || '',
      params.list || '',
      params.list_id || '',
      params.heading || '',
      params.completed ? 'true' : 'false',
      params.canceled ? 'true' : 'false',
      params.checklist_items?.join('\n') || ''
    ];
  }

  /**
   * Build arguments array for update-todo AppleScript
   * Order: id, title, notes, when, deadline, tags, list, listId, completed, canceled
   */
  private buildUpdateTodoArgs(params: UpdateTodoJSONParams): string[] {
    return [
      params.id,
      params.title || '',
      params.notes || '',
      params.when || '',
      params.deadline || '',
      params.tags?.join(',') || '',
      params.list || '',
      params.list_id || '',
      params.completed !== undefined ? String(params.completed) : '',
      params.canceled !== undefined ? String(params.canceled) : ''
    ];
  }

  /**
   * Build arguments array for create-project AppleScript
   * Order: title, notes, when, deadline, tags, areaId, area, completed, canceled
   */
  private buildProjectArgs(params: AddProjectParams): string[] {
    return [
      params.title || '',
      params.notes || '',
      params.when || '',
      params.deadline || '',
      params.tags?.join(',') || '',
      params.area_id || '',
      params.area || '',
      params.completed ? 'true' : 'false',
      params.canceled ? 'true' : 'false'
    ];
  }

  /**
   * Build arguments array for update-project AppleScript
   * Order: id, title, notes, when, deadline, tags, areaId, area, completed, canceled
   */
  private buildUpdateProjectArgs(params: UpdateProjectJSONParams): string[] {
    return [
      params.id,
      params.title || '',
      params.notes || '',
      params.when || '',
      params.deadline || '',
      params.tags?.join(',') || '',
      params.area_id || '',
      params.area || '',
      params.completed !== undefined ? String(params.completed) : '',
      params.canceled !== undefined ? String(params.canceled) : ''
    ];
  }
}

// Export singleton instance
export const jsonBuilder = new ThingsJSONBuilder();
