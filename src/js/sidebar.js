import { bigwinList } from "./config.js";
import fields from "./fields.js";

export function openNav() {
  fields.sidebar.style.width = "500px";
  main.style.marginRight = "500px";
}

export function closeNav() {
  fields.sidebar.style.width = "0";
  main.style.marginRight = "0";
}

document.addEventListener("mouseover", (e) => {
  fields.openSidebar.style.opacity = 1;
});

document.addEventListener("mouseout", (e) => {
  fields.openSidebar.style.opacity = 0;
});

document.addEventListener("click", (e) => {
  if (e.target === fields.openSidebar) {
    openNav();
  } else if (e.target === fields.closeSidebar) {
    closeNav();
  }
});

Object.keys(bigwinList).map((bw) => {
  const option = document.createElement("option");
  option.textContent = `${bigwinList[bw].code} ${bigwinList[bw].name}`;
  option.value = `${bw}`;
  return fields.bigwin.append(option);
});
