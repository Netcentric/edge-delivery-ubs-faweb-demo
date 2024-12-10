import { createOptimizedPicture } from '../../scripts/aem.js';
import { createElement, variantsClassesToBEM } from '../../scripts/common.js';

const variantClasses = ['2-columns', '3-columns'];

export default function decorate(block) {
  const blockName = 'cards';

  variantsClassesToBEM(block.classList, variantClasses, blockName);

  /* change to ul, li */
  const ul = createElement('ul', {
    classes: `${blockName}__list`,
  });
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = `${blockName}__card-image`;
      else div.className = `${blockName}__card-body`;
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
