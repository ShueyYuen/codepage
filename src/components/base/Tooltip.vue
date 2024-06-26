<template>
  <span :tooltip="tips" :position="position"
      :class="{multiline: multiline}"
      :style="`--trans: ${transform}px;`">
    <slot />
  </span>
</template>

<script>
export default {
  name: "Tooltip",
  props: {
    tips: {
      type: String,
      default: "tooltip text",
    },
    position: {
      default: "bottom",
      type: String,
    },
    multiline: {
      default: false,
      type: Boolean,
    },
    transform: {
      default: "0",
      type: String,
    }
  },
};
</script>

<style lang="less" scoped>
[tooltip] {
  & > * {
    display: inline-block;
  }
  position: relative;
  &:before,
  &:after {
    text-transform: none; /* opinion 2 */
    font-size: 0.8em; /* opinion 3 */
    line-height: 1;
    user-select: none;
    pointer-events: none;
    position: absolute;
    display: none;
    opacity: 0;
  }
  &:before {
    content: "";
    border: 5px solid transparent;
    z-index: 1001;
  }
  &:after {
    content: attr(tooltip);
    font-family: Helvetica, sans-serif;
    text-align: center;
    min-width: 2.4em;
    max-width: 21em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0.3rem;
    border-radius: 0.3rem;
    box-shadow: 0 1em 2em -0.5em rgba(0, 0, 0, 0.35);
    background: #495057;
    color: #fff;
    z-index: 1000; /* absurdity 2 */
  }
  &:hover:before,
  &:hover:after {
    display: block;
  }
  /* position: TOP */
  &:not([position]):before,
  &[position^="top"]:before {
    bottom: 100%;
    border-bottom-width: 0;
    border-top-color: #495057;
  }
  &:not([position]):after,
  &[position^="top"]::after {
    bottom: calc(100% + 5px);
  }

  &:not([position])::before,
  &:not([position])::after,
  &[position^="top"]::before,
  &[position^="top"]::after {
    left: calc(50% + var(--trans));
    transform: translate(calc(-50% + var(--trans)), -0.5em);
  }

  /* position: BOTTOM */
  &[position^="bottom"]::before {
    top: 105%;
    border-top-width: 0;
    border-bottom-color: #495057;
  }
  &[position^="bottom"]::after {
    top: calc(105% + 5px);
  }
  &[position^="bottom"]::before,
  &[position^="bottom"]::after {
    left: calc(50% + var(--trans));
    transform: translate(calc(-50% + var(--trans)), 0.5em);
  }

  /* position: LEFT */
  &[position^="left"]::before {
    top: 50%;
    border-right-width: 0;
    border-left-color: #495057;
    left: calc(0em - 5px);
    transform: translate(-0.5em, -50%);
  }
  &[position^="left"]::after {
    top: calc(50% + var(--trans));
    right: calc(100% + 5px);
    transform: translate(-0.5em, calc(-50% + var(--trans)));
  }

  /* position: RIGHT */
  &[position^="right"]::before {
    top: 50%;
    border-left-width: 0;
    border-right-color: #495057;
    right: calc(0em - 5px);
    transform: translate(0.5em, -50%);
  }
  &[position^="right"]::after {
    top: calc(50% + var(--trans));
    left: calc(100% + 5px);
    transform: translate(0.5em, -50%);
  }

  /* FX All The Things */
  &:not([position]):hover::before,
  &:not([position]):hover::after,
  &[position^="top"]:hover::before,
  &[position^="top"]:hover::after,
  &[position^="bottom"]:hover::before,
  &[position^="bottom"]:hover::after {
    animation: tooltips-vert 300ms ease-out forwards;
  }

  &[position^="left"]:hover::before,
  &[position^="left"]:hover::after,
  &[position^="right"]:hover::before,
  &[position^="right"]:hover::after {
    animation: tooltips-horz 300ms ease-out forwards;
  }
}

.multiline {
  &::after {
    width: 300px;
    white-space: normal;
  }
}

/* don't show empty tooltips */
[tooltip=""]::before,
[tooltip=""]::after {
  display: none !important;
}

@keyframes tooltips-vert {
  to {
    opacity: 0.9;
    transform: translate(-50%, 0);
  }
}

@keyframes tooltips-horz {
  to {
    opacity: 0.9;
    transform: translate(0, -50%);
  }
}
</style>
