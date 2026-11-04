/**
 * The desktop's window manager. One window is open at a time — the lesson the
 * reader is in — so a slug and a minimised flag are the whole state. The lesson
 * window writes it on mount; the taskbar reads it to know whether to draw a tab.
 */
class OpenWindows {
	currentLesson = $state<string | null>(null);
	isMinimized = $state(false);
	/** The window that currently holds focus: its title bar is blue, every other is grey. */
	activeWindowId = $state<string | null>(null);
}

export const openWindows = new OpenWindows();
