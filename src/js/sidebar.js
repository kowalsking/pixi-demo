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
  return fields.bigwinName.append(option);
});

fields.bigwinDuration.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = -e.deltaY;
  fields.bigwinDuration.value = +fields.bigwinDuration.value + delta;
});

fields.addParameter.addEventListener("click", (e) => {
  fields.addAlphaPopup.style.display = "block";
});

fields.okAlpha.addEventListener("click", (e) => {
  const time = fields.addAlphaPopup.querySelectorAll("input")[0];
  const value = fields.addAlphaPopup.querySelectorAll("input")[1];
  const tbody = fields.particleAlphaTable.querySelector("tbody");
  const children = Array.from(tbody.querySelectorAll("tr"));
  const tr = document.createElement("tr");
  fields.invalidJson.textContent = "";

  if (!time.value || !value.value) {
    return (fields.invalidJson.textContent = "All parameters is mandatory");
  }
  tr.innerHTML = `
  <tr>
    <td>${time.value}</td>
    <input
    type="number"
    step="0.1"
    min="0"
    max="1"
    value="${value.value}"
  />
</td>
    <td><button class="deleteParameter">-</button></td>
  </tr>
  `;
  tbody.textContent = "";
  children.push(tr);

  children
    .sort((first, second) => {
      const a = +first.querySelector("td").textContent;
      const b = +second.querySelector("td").textContent;
      return a - b;
    })
    .forEach((tr) => {
      tbody.append(tr);
    });

  fields.addAlphaPopup.style.display = "none";
});

fields.particleAlphaTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("deleteParameter")) {
    const td = e.target.parentNode.parentNode;
    td.remove();
  }
});
