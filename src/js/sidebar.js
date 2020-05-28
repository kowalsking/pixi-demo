import { bigwinList } from "./config.js";

const sidebar = document.querySelector("#sidebar");
const main = document.querySelector("#main");
const openSidebar = document.querySelector(".openSidebar");
const closeSidebar = document.querySelector(".closeSidebar");
const bigwin = document.querySelector("#bigwin");

export function openNav() {
  sidebar.style.width = "500px";
  main.style.marginRight = "500px";
}

export function closeNav() {
  sidebar.style.width = "0";
  main.style.marginRight = "0";
}

document.addEventListener("mouseover", (e) => {
  openSidebar.style.opacity = 1;
});

document.addEventListener("mouseout", (e) => {
  openSidebar.style.opacity = 0;
});

document.addEventListener("click", (e) => {
  if (e.target === openSidebar) {
    openNav();
  } else if (e.target === closeSidebar) {
    closeNav();
  }
});
console.log(1);

Object.keys(bigwinList).map((bw) => {
  const option = document.createElement("option");
  option.textContent = `${bigwinList[bw].code} ${bigwinList[bw].name}`;
  option.value = `${bw}`;
  return bigwin.append(option);
});
