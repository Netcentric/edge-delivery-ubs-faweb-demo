import { loadSections } from './aem.js';

/**
 * Create an element with the given id and classes.
 * @param {string} tagName - The tag name for the element.
 * @param {Object} [options={}] - The options for the element.
 * @param {string[]|string} [options.classes=[]] - The class or classes to add to the element.
 * @param {Object} [options.props={}] - Additional attributes to add to the element.
 * @returns {HTMLElement} - The created HTML element.
 */
export function createElement(tagName, options = {}) {
  const { classes = [], props = {} } = options;
  const elem = document.createElement(tagName);
  const isString = typeof classes === 'string';
  if (classes || (isString && classes !== '') || (!isString && classes.length > 0)) {
    const classesArr = isString ? [classes] : classes;
    elem.classList.add(...classesArr);
  }
  if (!isString && classes.length === 0) elem.removeAttribute('class');

  if (props) {
    Object.keys(props).forEach((propName) => {
      const value = propName === props[propName] ? '' : props[propName];
      elem.setAttribute(propName, value);
    });
  }

  return elem;
}

/**
 * Create a new section with a specific name and append a given node to it.
 * @param {string} blockName - The block name.
 * @param {string} sectionName - The name of the section (e.g., content-section, media-section).
 * @param {HTMLElement} node - The HTML element to append to the section.
 * @returns {HTMLElement} - The newly created section element with the appended node.
 */
export function createNewSection(blockName, sectionName, node) {
  const section = createElement('div', { classes: `${blockName}__${sectionName}-section` });
  section.append(node);
  return section;
}

/**
 * Remove empty tags from a given block.
 * @param {HTMLElement} block - The block element from which empty tags will be removed.
 */
export const removeEmptyTags = (block) => {
  block.querySelectorAll('*').forEach((x) => {
    const tagName = `</${x.tagName}>`;

    // Exclude iframes
    if (x.tagName.toUpperCase() === 'IFRAME') {
      return;
    }

    // Remove tags with no content and are not self-closing
    if (
      x.outerHTML.slice(tagName.length * -1).toUpperCase() === tagName
      && x.innerHTML.trim().length === 0
    ) {
      x.remove();
    }
  });
};

/**
 * Unwrap nested divs in an element by moving their children up one level.
 * @param {HTMLElement} element - The element to process.
 * @param {Object} [options={}] - Additional options.
 * @param {boolean} [options.ignoreDataAlign=false] - To ignore data-align / data-valign attributes.
 */
export const unwrapDivs = (element, options = {}) => {
  const stack = [element];
  const { ignoreDataAlign = false } = options;

  while (stack.length > 0) {
    const currentElement = stack.pop();

    let i = 0;
    while (i < currentElement.children.length) {
      const node = currentElement.children[i];
      const attributesLength = [...node.attributes].filter((el) => {
        if (ignoreDataAlign) {
          return !(el.name.startsWith('data-align') || el.name.startsWith('data-valign'));
        }
        return el;
      }).length;

      if (node.tagName === 'DIV' && attributesLength === 0) {
        while (node.firstChild) {
          currentElement.insertBefore(node.firstChild, node);
        }
        node.remove();
      } else {
        stack.push(node);
        i += 1;
      }
    }
  }
};

/**
 * Convert block classes to BEM-compliant class names based on expected variants.
 * @param {DOMTokenList} blockClasses - The list of classes to process.
 * @param {string[]} expectedVariantsNames - Array of variant class names to process.
 * @param {string} blockName - The block name to use in the BEM naming convention.
 */
export const variantsClassesToBEM = (blockClasses, expectedVariantsNames, blockName) => {
  expectedVariantsNames.forEach((variant) => {
    if (blockClasses.contains(variant)) {
      blockClasses.remove(variant);
      blockClasses.add(`${blockName}--${variant}`);
    }
  });
};

/**
 * Load a block dynamically with content and optional variant classes.
 * @param {string} blockName - The block name.
 * @param {string} blockContent - The content to set as the block's inner HTML.
 * @param {Object} [options={}] - Additional options.
 * @param {string[]} [options.variantsClasses=[]] - Classes to add for styling variants.
 * @returns {Promise<HTMLElement>} - The loaded block element.
 */
export async function loadAsBlock(blockName, blockContent, options = {}) {
  const { variantsClasses = [] } = options;
  const blockEl = createElement('div', {
    classes: ['block', blockName, ...variantsClasses],
    props: { 'data-block-name': blockName },
  });
  const wrapperEl = createElement('div');
  wrapperEl.append(blockEl);

  blockEl.innerHTML = blockContent;
  await loadSections(wrapperEl);

  return blockEl;
}

/**
 * Create a debounced version of a function.
 * @param {function} func - The callback function to debounce.
 * @param {number} [timeout=200] - The debounce timeout in milliseconds.
 * @returns {function} - A debounced function.
 */
export function debounce(func, timeout = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
