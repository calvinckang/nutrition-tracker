/**
 * Keeps focused inputs visible above the mobile keyboard by scrolling them into view
 * with a configurable padding above the keyboard.
 */

const PADDING_BOTTOM = 20;

function getScrollTarget(el: EventTarget | null): Element | null {
	if (!el || !(el instanceof Element)) return null;
	// If focus is inside a Material Web component (shadow DOM), use the host
	const root = el.getRootNode();
	if (root instanceof ShadowRoot && root.host) {
		return root.host;
	}
	return el;
}

function scrollInputAboveKeyboard(el: Element, paddingBottom: number): void {
	const vv = window.visualViewport;
	const rect = el.getBoundingClientRect();
	const visibleBottom = vv.height - paddingBottom;

	if (rect.bottom <= visibleBottom) return;

	const scrollContainer =
		document.querySelector<HTMLElement>('.main-content') ??
		(document.scrollingElement as HTMLElement) ??
		document.documentElement;

	if (!scrollContainer) return;

	const scrollDelta = rect.bottom - visibleBottom;
	scrollContainer.scrollTop += scrollDelta;
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

	const onResize = (): void => {
		if (document.activeElement && el.contains(document.activeElement)) {
			scrollInputAboveKeyboard(el, PADDING_BOTTOM);
		}
	};

	const onBlur = (): void => {
		window.visualViewport.removeEventListener('resize', onResize);
	};

	// Delay to allow keyboard animation to start
	const timeoutId = setTimeout(() => scrollInputAboveKeyboard(el, PADDING_BOTTOM), 300);

	window.visualViewport.addEventListener('resize', onResize);
	document.addEventListener(
		'focusout',
		(e) => {
			clearTimeout(timeoutId);
			onBlur();
		},
		{ once: true }
	);
}

export function initScrollAboveKeyboard(): () => void {
	document.addEventListener('focusin', handleInputFocus);
	return () => document.removeEventListener('focusin', handleInputFocus);
}
