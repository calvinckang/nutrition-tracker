/**
 * Keeps focused inputs visible above the mobile keyboard by scrolling them into view.
 *
 * Uses scrollIntoView + repeated delays because iOS Safari's keyboard animates slowly
 * and the visualViewport resize event can be unreliable.
 */

const DELAYS_MS = [100, 300, 500, 700, 1000];

function getScrollTarget(el: EventTarget | null): Element | null {
	if (!el || !(el instanceof Element)) return null;
	// If focus is inside a Material Web component (shadow DOM), use the host
	const root = el.getRootNode();
	if (root instanceof ShadowRoot && root.host) {
		return root.host;
	}
	return el;
}

function scrollInputIntoView(el: Element): void {
	// block: 'center' keeps input in the visible area above the keyboard
	el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
}

function scheduleScrollAttempts(el: Element): () => void {
	const timeouts: ReturnType<typeof setTimeout>[] = [];
	for (const ms of DELAYS_MS) {
		timeouts.push(setTimeout(() => scrollInputIntoView(el), ms));
	}
	return () => timeouts.forEach((t) => clearTimeout(t));
}

function handleInputFocus(e: FocusEvent): void {
	const target = getScrollTarget(e.target);
	if (!target) return;

	const isInput =
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement;

	const isMaterialField =
		target instanceof HTMLElement &&
		(target.tagName === 'MD-FILLED-TEXT-FIELD' || target.tagName === 'MD-FILLED-SELECT');

	if (!isInput && !isMaterialField) return;

	const el = isMaterialField ? target : (target.closest('md-filled-text-field, md-filled-select') as Element ?? target);

	const onViewportChange = (): void => {
		if (document.activeElement && el.contains(document.activeElement)) {
			scrollInputIntoView(el);
		}
	};

	const onBlur = (): void => {
		window.visualViewport.removeEventListener('resize', onViewportChange);
		window.visualViewport.removeEventListener('scroll', onViewportChange);
	};

	const cancelScheduled = scheduleScrollAttempts(el);
	window.visualViewport.addEventListener('resize', onViewportChange);
	window.visualViewport.addEventListener('scroll', onViewportChange);

	document.addEventListener(
		'focusout',
		() => {
			cancelScheduled();
			onBlur();
		},
		{ once: true }
	);
}

export function initScrollAboveKeyboard(): () => void {
	document.addEventListener('focusin', handleInputFocus);
	return () => document.removeEventListener('focusin', handleInputFocus);
}
