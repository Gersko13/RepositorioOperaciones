/*
  Repositorio interno de herramientas Tasatop.

  IMPORTANTE:
  Este login usa credenciales simuladas en frontend solo para fines de demostración.
  Para producción se debe implementar autenticación real y segura con backend,
  Firebase, Supabase, Auth0 u otra solución con control de sesiones y permisos.
*/

const STORAGE_KEY = "tasatop_tools_repository_v2";
const SESSION_KEY = "tasatop_current_user_v2";

const USERS = [
  {
    username: "operaciones",
    password: "operaciones123",
    role: "admin",
    area: "operaciones",
    areaLabel: "Área Operaciones"
  },
  {
    username: "comercial",
    password: "comercial123",
    role: "comercial",
    area: "comercial",
    areaLabel: "Área Comercial"
  },
  {
    username: "cobranza",
    password: "cobranza123",
    role: "cobranza",
    area: "cobranza",
    areaLabel: "Área Cobranza"
  }
];

const AREA_LABELS = {
  operaciones: "Área Operaciones",
  comercial: "Área Comercial",
  cobranza: "Área Cobranza"
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80";

const INITIAL_TOOLS = [
  {
    id: "tool-1",
    title: "Simulador de Inversión",
    subtitle: "Cronograma",
    link: "https://gersko13.github.io/CRONOGRAMA-SIMULADOR/",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    visibleTo: ["operaciones", "comercial"]
  },
  {
    id: "tool-2",
    title: "Ticketera Operaciones",
    subtitle: "Recopila las solicitudes generadas a través de la ticketera",
    link: "https://gersko13.github.io/Ticketera_Operaciones/",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    visibleTo: ["operaciones", "comercial"]
  },
  {
    id: "tool-3",
    title: "Tarifario Excepcional",
    subtitle: "Solicitud al área de riesgos para tarifarios excepcionales",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSeXxXecUonhoBZ5Azdg4HScBR4ONFFOOG5B3hr84bcnV71Grw/viewform",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
    visibleTo: ["operaciones", "comercial"]
  },
  {
    id: "tool-4",
    title: "Reporte de Pagos",
    subtitle: "Aquí se extraen los reportes mensuales de pagos por empresa",
    link: "https://gersko13.github.io/REPORTEDEPAGOS-MENSUAL/",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    visibleTo: ["operaciones", "cobranza"]
  },
  {
    id: "tool-5",
    title: "Base Maestra - Ticketera de Operaciones",
    subtitle: "Se gestionan los tickets solicitados",
    link: "https://docs.google.com/spreadsheets/d/1jws1PA3eHScIOARwpGRB-WwbeIY85wr6P-5GkT_0rDk/edit?gid=0#gid=0",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    visibleTo: ["operaciones"]
  },
  {
    id: "tool-6",
    title: "Generador de Contrato y Pagaré",
    subtitle: "Se completan los campos y se envían los documentos generados al correo",
    link: "https://docs.google.com/forms/d/e/1FAIpQLSdsHEvN11lCeE-0kVeBjvzer9jCozI_VVLnIBZuIKMhgiofhw/viewform",
    image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
    visibleTo: ["operaciones"]
  }
];

let tools = [];
let currentUser = null;

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const logoutBtn = document.getElementById("logoutBtn");
const userBadge = document.getElementById("userBadge");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeSubtitle = document.getElementById("welcomeSubtitle");
const createToolBtn = document.getElementById("createToolBtn");
const adminNotice = document.getElementById("adminNotice");

const searchInput = document.getElementById("searchInput");
const toolsGrid = document.getElementById("toolsGrid");
const emptyState = document.getElementById("emptyState");

const toolModal = document.getElementById("toolModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const modalTitle = document.getElementById("modalTitle");

const toolForm = document.getElementById("toolForm");
const toolFormMessage = document.getElementById("toolFormMessage");

const toolIdInput = document.getElementById("toolId");
const toolTitleInput = document.getElementById("toolTitle");
const toolSubtitleInput = document.getElementById("toolSubtitle");
const toolLinkInput = document.getElementById("toolLink");
const toolImageInput = document.getElementById("toolImage");

const toast = document.getElementById("toast");

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  loadFromLocalStorage();

  const savedUser = sessionStorage.getItem(SESSION_KEY);

  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    renderDashboard();
  } else {
    showLogin();
  }

  loginForm.addEventListener("submit", login);
  logoutBtn.addEventListener("click", logout);
  createToolBtn.addEventListener("click", createTool);
  searchInput.addEventListener("input", filterTools);

  toolForm.addEventListener("submit", handleToolSubmit);
  modalBackdrop.addEventListener("click", closeToolModal);
  closeModalBtn.addEventListener("click", closeToolModal);
  cancelModalBtn.addEventListener("click", closeToolModal);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !toolModal.classList.contains("hidden")) {
      closeToolModal();
    }
  });
}

function login(event) {
  event.preventDefault();

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value.trim();

  loginMessage.textContent = "";

  if (!username || !password) {
    showLoginError("Por favor, ingresa usuario y contraseña.");
    return;
  }

  const userFound = USERS.find(function (user) {
    return user.username === username && user.password === password;
  });

  if (!userFound) {
    showLoginError("Credenciales incorrectas. Verifica tus datos e intenta nuevamente.");
    return;
  }

  currentUser = {
    username: userFound.username,
    role: userFound.role,
    area: userFound.area,
    areaLabel: userFound.areaLabel
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));

  usernameInput.value = "";
  passwordInput.value = "";

  renderDashboard();
  showToast("Bienvenido, " + currentUser.areaLabel + ".");
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem(SESSION_KEY);

  searchInput.value = "";
  showLogin();
  showToast("Sesión cerrada correctamente.");
}

function renderDashboard() {
  if (!currentUser) {
    showLogin();
    return;
  }

  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");

  userBadge.textContent = currentUser.areaLabel;

  const isAdmin = currentUser.role === "admin";

  welcomeTitle.textContent = isAdmin
    ? "Panel de herramientas operativas"
    : "Herramientas disponibles";

  welcomeSubtitle.textContent = isAdmin
    ? "Administra herramientas, enlaces y permisos de visibilidad por área."
    : "Visualiza y abre únicamente las herramientas autorizadas para tu área.";

  createToolBtn.classList.toggle("hidden", !isAdmin);
  adminNotice.classList.toggle("hidden", !isAdmin);

  renderTools();
}

function renderTools() {
  toolsGrid.innerHTML = "";

  const query = searchInput.value.trim().toLowerCase();

  const visibleTools = getVisibleTools().filter(function (tool) {
    const title = tool.title.toLowerCase();
    const subtitle = tool.subtitle.toLowerCase();

    return title.includes(query) || subtitle.includes(query);
  });

  emptyState.classList.toggle("hidden", visibleTools.length > 0);

  visibleTools.forEach(function (tool) {
    const card = document.createElement("article");
    card.className = "tool-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Abrir " + tool.title);

    card.addEventListener("click", function () {
      openTool(tool.id);
    });

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTool(tool.id);
      }
    });

    if (currentUser.role === "admin") {
      const adminActions = document.createElement("div");
      adminActions.className = "admin-actions";

      const editButton = document.createElement("button");
      editButton.className = "icon-btn";
      editButton.type = "button";
      editButton.title = "Editar bloque";
      editButton.innerHTML = "✎";

      editButton.addEventListener("click", function (event) {
        event.stopPropagation();
        editTool(tool.id);
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "icon-btn";
      deleteButton.type = "button";
      deleteButton.title = "Eliminar bloque";
      deleteButton.innerHTML = "🗑";

      deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        deleteTool(tool.id);
      });

      adminActions.appendChild(editButton);
      adminActions.appendChild(deleteButton);
      card.appendChild(adminActions);
    }

    const imageBox = document.createElement("div");
    imageBox.className = "tool-image";

    const image = document.createElement("img");
    image.src = tool.image || FALLBACK_IMAGE;
    image.alt = tool.title;
    image.loading = "lazy";

    image.onerror = function () {
      image.src = FALLBACK_IMAGE;
    };

    imageBox.appendChild(image);

    const content = document.createElement("div");
    content.className = "tool-content";

    const title = document.createElement("h3");
    title.textContent = tool.title;

    const subtitle = document.createElement("p");
    subtitle.textContent = tool.subtitle;

    const areaTags = document.createElement("div");
    areaTags.className = "area-tags";

    tool.visibleTo.forEach(function (area) {
      const tag = document.createElement("span");
      tag.className = "area-tag";
      tag.textContent = AREA_LABELS[area] || area;
      areaTags.appendChild(tag);
    });

    const actions = document.createElement("div");
    actions.className = "tool-actions";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "btn btn-primary";
    openButton.textContent = "Abrir herramienta";

    openButton.addEventListener("click", function (event) {
      event.stopPropagation();
      openTool(tool.id);
    });

    actions.appendChild(openButton);

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(areaTags);
    content.appendChild(actions);

    card.appendChild(imageBox);
    card.appendChild(content);

    toolsGrid.appendChild(card);
  });
}

function openTool(toolId) {
  const tool = tools.find(function (item) {
    return item.id === toolId;
  });

  if (!tool) {
    showToast("No se encontró la herramienta seleccionada.");
    return;
  }

  const canOpen = currentUser.role === "admin" || tool.visibleTo.includes(currentUser.area);

  if (!canOpen) {
    showToast("No tienes autorización para abrir esta herramienta.");
    return;
  }

  window.open(tool.link, "_blank", "noopener,noreferrer");
}

function createTool() {
  if (!isAdminUser()) return;

  modalTitle.textContent = "Crear bloque";
  clearToolForm();

  toolModal.classList.remove("hidden");
  toolTitleInput.focus();
}

function editTool(toolId) {
  if (!isAdminUser()) return;

  const tool = tools.find(function (item) {
    return item.id === toolId;
  });

  if (!tool) {
    showToast("No se encontró el bloque seleccionado.");
    return;
  }

  modalTitle.textContent = "Editar bloque";
  toolFormMessage.textContent = "";

  toolIdInput.value = tool.id;
  toolTitleInput.value = tool.title;
  toolSubtitleInput.value = tool.subtitle;
  toolLinkInput.value = tool.link;
  toolImageInput.value = tool.image || "";

  setSelectedAreas(tool.visibleTo);

  toolModal.classList.remove("hidden");
  toolTitleInput.focus();
}

function deleteTool(toolId) {
  if (!isAdminUser()) return;

  const tool = tools.find(function (item) {
    return item.id === toolId;
  });

  if (!tool) {
    showToast("No se encontró el bloque seleccionado.");
    return;
  }

  const confirmed = confirm("¿Deseas eliminar el bloque: " + tool.title + "?");

  if (!confirmed) return;

  tools = tools.filter(function (item) {
    return item.id !== toolId;
  });

  saveToLocalStorage();
  renderTools();
  showToast("Bloque eliminado correctamente.");
}

function handleToolSubmit(event) {
  event.preventDefault();

  if (!isAdminUser()) return;

  const id = toolIdInput.value;
  const title = toolTitleInput.value.trim();
  const subtitle = toolSubtitleInput.value.trim();
  const link = toolLinkInput.value.trim();
  const image = toolImageInput.value.trim();
  const visibleTo = getSelectedAreas();

  toolFormMessage.textContent = "";

  if (!title || !subtitle || !link || !image) {
    showToolFormError("Completa título, subtítulo, link e imagen de la herramienta.");
    return;
  }

  if (!isValidUrl(link)) {
    showToolFormError("Ingresa un link válido. Debe iniciar con http:// o https://");
    return;
  }

  if (!isValidUrl(image)) {
    showToolFormError("Ingresa una URL de imagen válida. Debe iniciar con http:// o https://");
    return;
  }

  if (visibleTo.length === 0) {
    showToolFormError("Selecciona al menos un área visible.");
    return;
  }

  if (id) {
    const index = tools.findIndex(function (item) {
      return item.id === id;
    });

    if (index === -1) {
      showToolFormError("No se encontró el bloque que intentas editar.");
      return;
    }

    tools[index] = {
      id: id,
      title: title,
      subtitle: subtitle,
      link: link,
      image: image,
      visibleTo: visibleTo
    };

    saveToLocalStorage();
    closeToolModal();
    renderTools();
    showToast("Bloque actualizado correctamente.");
    return;
  }

  const newTool = {
    id: generateId(),
    title: title,
    subtitle: subtitle,
    link: link,
    image: image,
    visibleTo: visibleTo
  };

  tools.unshift(newTool);

  saveToLocalStorage();
  closeToolModal();
  renderTools();
  showToast("Bloque creado correctamente.");
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
}

function loadFromLocalStorage() {
  const savedTools = localStorage.getItem(STORAGE_KEY);

  if (!savedTools) {
    tools = structuredCloneSafe(INITIAL_TOOLS);
    saveToLocalStorage();
    return;
  }

  try {
    const parsedTools = JSON.parse(savedTools);

    if (!Array.isArray(parsedTools)) {
      throw new Error("Formato inválido");
    }

    tools = parsedTools;
  } catch (error) {
    console.warn("No se pudo cargar localStorage. Se restauraron los bloques iniciales.", error);
    tools = structuredCloneSafe(INITIAL_TOOLS);
    saveToLocalStorage();
  }
}

function filterTools() {
  renderTools();
}

function getVisibleTools() {
  if (!currentUser) return [];

  if (currentUser.role === "admin") {
    return tools;
  }

  return tools.filter(function (tool) {
    return Array.isArray(tool.visibleTo) && tool.visibleTo.includes(currentUser.area);
  });
}

function isAdminUser() {
  if (!currentUser || currentUser.role !== "admin") {
    showToast("No tienes permisos para realizar esta acción.");
    return false;
  }

  return true;
}

function showLogin() {
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
  loginMessage.textContent = "";
}

function showLoginError(message) {
  loginMessage.textContent = message;
}

function showToolFormError(message) {
  toolFormMessage.textContent = message;
}

function closeToolModal() {
  toolModal.classList.add("hidden");
  clearToolForm();
}

function clearToolForm() {
  toolForm.reset();
  toolIdInput.value = "";
  toolFormMessage.textContent = "";
  setSelectedAreas([]);
}

function getSelectedAreas() {
  const checkboxes = document.querySelectorAll(".areaCheckbox");

  return Array.from(checkboxes)
    .filter(function (checkbox) {
      return checkbox.checked;
    })
    .map(function (checkbox) {
      return checkbox.value;
    });
}

function setSelectedAreas(areas) {
  const checkboxes = document.querySelectorAll(".areaCheckbox");

  checkboxes.forEach(function (checkbox) {
    checkbox.checked = areas.includes(checkbox.value);
  });
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function generateId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "tool-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function structuredCloneSafe(data) {
  if (typeof structuredClone === "function") {
    return structuredClone(data);
  }

  return JSON.parse(JSON.stringify(data));
}

let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(function () {
    toast.classList.add("hidden");
  }, 2800);
}