export default function decorate(block) {
  block.firstElementChild.classList.add('text-image__container');
  const pictureParent = block.querySelector('picture').parentElement;
  pictureParent?.classList.add('text-image__imageContainer');
}
