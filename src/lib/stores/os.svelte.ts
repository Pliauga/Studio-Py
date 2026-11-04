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
	/** Raised by the layout for the one navigation that opens the lesson window from the
	 *  dashboard, and read once by the lesson on mount: only that arrival expands out of the
	 *  Dock. A move between lessons remounts the same window and must not replay it. */
	windowOpening = false;
}

export const openWindows = new OpenWindows();
