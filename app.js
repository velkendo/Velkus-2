const DB_KEY = "studentsphere_demo_v1";
let authMode = "login";
let currentUser = null;
let activeSection = "overview";
let editingId = null;

const $ = (id) => document.getElementById(id);
const today = new Date();
const isoDate = (d) => d.toISOString().slice(0,10);

function seedDatabase() {
  if (localStorage.getItem(DB_KEY)) return;
  const users = [
    {
      id: "ADMIN001",
      name: "Portal Administrator",
      email: "admin@studentsphere.demo",
      password: "admin123",
      role: "admin",
      course: "Administration",
      year: "Staff",
      createdAt: isoDate(today)
    },
    {
      id: "STU20260001",
      name: "Aanya Sharma",
      email: "aanya@example.com",
      password: "student123",
      role: "student",
      course: "B.Tech Information Technology",
      year: "Second Year",
      dob: "2006-03-14",
      age: 20,
      parents: "Rajesh Sharma and Neeta Sharma",
      phone: "+91 90000 10001",
      address: "Mumbai, Maharashtra",
      bloodGroup: "O+",
      medical: "No medical information provided",
      className: "IT-2A",
      attendance: 92,
      marks: 86,
      subjects: [["Data Structures", 88], ["Database Management", 91], ["Computer Networks", 82], ["Mathematics", 83]],
      createdAt: isoDate(today)
    },
    {
      id: "STU20260002",
      name: "Arjun Mehta",
      email: "arjun@example.com",
      password: "student123",
      role: "student",
      course: "B.Sc Computer Science",
      year: "First Year",
      dob: "2007-08-21",
      age: 19,
      parents: "Kunal Mehta and Priya Mehta",
      phone: "+91 90000 10002",
      address: "Thane, Maharashtra",
      bloodGroup: "B+",
      medical: "No medical information provided",
      className: "CS-1B",
      attendance: 84,
      marks: 78,
      subjects: [["Programming Fundamentals", 82], ["Mathematics", 76], ["Digital Systems", 80], ["Communication Skills", 74]],
      createdAt: isoDate(today)
    }
  ];
  saveUsers(users);
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; } 
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

function setMessage(text, isError = true) {
  $("auth-message").textContent = text;
  $("auth-message").style.color = isError ? "#d14b5b" : "#168763";
}

function switchMode(mode) {
  authMode = mode;
  $("login-tab").classList.toggle("active", mode === "login");
  $("signup-tab").classList.toggle("active", mode === "signup");
  $("name-field").classList.toggle("hidden", mode !== "signup");
  $("role-field").classList.toggle("hidden", mode !== "signup");

  const role = $("accountRole")?.value || "student";
  $("extra-signup").classList.toggle("hidden", mode !== "signup" || role === "admin");

  $("auth-title").textContent = mode === "login" ? "Sign in to your account" : "Create your account";
  $("auth-subtitle").textContent = mode === "login" 
    ? "Enter your credentials to continue to your portal." 
    : "Register to receive your permanent Student or Admin ID.";
  $("auth-submit").innerHTML = mode === "login" ? 'Sign In <span>→</span>' : 'Create Account <span>→</span>';
  $("identity").placeholder = mode === "login" ? "Enter Student/Admin ID or email" : "Choose an email address";
  $("identity").autocomplete = mode === "login" ? "username" : "email";
  $("password").autocomplete = mode === "login" ? "current-password" : "new-password";
  $("password").placeholder = mode === "login" ? "Enter your password" : "Create a password (at least 4 characters)";
  setMessage("");
}

function nextStudentId(users) {
  const year = new Date().getFullYear();
  const prefix = "STU" + year;
  const nums = users.filter(u => u.id.startsWith(prefix)).map(u => Number(u.id.slice(prefix.length))).filter(Number.isFinite);
  return prefix + String(Math.max(0, ...nums) + 1).padStart(4, "0");
}

function nextAdminId(users) {
  const prefix = "ADMIN";
  const nums = users.filter(u => u.id.startsWith(prefix)).map(u => Number(u.id.slice(prefix.length))).filter(Number.isFinite);
  return prefix + String(Math.max(0, ...nums) + 1).padStart(3, "0");
}

$("accountRole")?.addEventListener("change", (e) => {
  if (authMode === "signup") {
    $("extra-signup").classList.toggle("hidden", e.target.value === "admin");
  }
});

$("login-tab").addEventListener("click", () => switchMode("login"));
$("signup-tab").addEventListener("click", () => switchMode("signup"));

$("auth-form").addEventListener("submit", e => {
  e.preventDefault();
  const users = getUsers(), identity = $("identity").value.trim().toLowerCase(), password = $("password").value;

  if (authMode === "signup") {
    const name = $("fullName").value.trim(), email = identity, role = $("accountRole").value;
    if (!name) { setMessage("Please enter your full name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage("Please enter a valid email address."); return; }
    if (users.some(u => u.email.toLowerCase() === email)) { setMessage("An account with this email already exists."); return; }
    if (password.length < 4) { setMessage("Password must be at least 4 characters."); return; }

    let user;
    if (role === "admin") {
      user = { id: nextAdminId(users), name, email, password, role: "admin", course: "Administration", year: "Staff", createdAt: isoDate(today) };
    } else {
      user = { id: nextStudentId(users), name, email, password, role: "student", course: $("course").value, year: $("year").value, dob: "", age: "", parents: "", phone: "", address: "", bloodGroup: "", medical: "No medical information provided", className: "Not assigned", attendance: 0, marks: 0, subjects: [], createdAt: isoDate(today) };
    }

    users.push(user);
    saveUsers(users);
    loginUser(user);
    showToast(`${role === "admin" ? "Admin" : "Student"} account created. Your ID is ${user.id}`);
    return;
  }

  // LOGIN VERIFICATION
  const user = users.find(u => u.id.toLowerCase() === identity || u.email.toLowerCase() === identity);
  if (!user || user.password !== password) {
    setMessage("Invalid Student/Admin ID or Password.");
    return;
  }
  loginUser(user);
});

// Demo button handlers - fills login details safely
document.querySelectorAll("[data-demo]").forEach(btn => btn.addEventListener("click", () => {
  switchMode("login");
  const role = btn.dataset.demo;
  if (role === "admin") {
    $("identity").value = "ADMIN001";
    $("password").value = "admin123";
    setMessage("Admin credentials filled. Click Sign In to continue.", false);
  } else {
    $("identity").value = "STU20260001";
    $("password").value = "student123";
    setMessage("Student credentials filled. Click Sign In to continue.", false);
  }
}));

function loginUser(user) {
  currentUser = user;
  activeSection = "overview";
  $("auth-view").classList.add("hidden");
  $("dashboard-view").classList.remove("hidden");
  $("side-name").textContent = user.name;
  $("side-role").textContent = user.role === "admin" ? "Administrator (" + user.id + ")" : "Student · " + user.id;
  $("side-avatar").textContent = initials(user.name);
  $("header-user-name").textContent = user.name;
  $("header-avatar").textContent = initials(user.name);

  document.querySelectorAll(".admin-only").forEach(el => el.classList.toggle("hidden", user.role !== "admin"));
  renderSection("overview");
}

function logout() {
  currentUser = null;
  $("dashboard-view").classList.add("hidden");
  $("auth-view").classList.remove("hidden");
  $("auth-form").reset();
  switchMode("login");
}

$("logout-btn").addEventListener("click", logout);
document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => renderSection(btn.dataset.section)));

function initials(name) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase(); }
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function updateNav(section) { document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.section === section)); }

function renderSection(section) {
  if (!currentUser) return;
  if (currentUser.role !== "admin" && section === "manage") section = "overview";
  activeSection = section; 
  updateNav(section);
  
  const titles = { overview: "Overview", profile: "Personal Profile", academics: "Academic Details", attendance: "Attendance", manage: "Manage Students" };
  $("page-title").textContent = titles[section] || "Overview";
  $("welcome-label").textContent = currentUser.role === "admin" ? "ADMINISTRATION PORTAL" : "STUDENT PORTAL";
  
  if (section === "overview") renderOverview();
  if (section === "profile") renderProfile();
  if (section === "academics") renderAcademics();
  if (section === "attendance") renderAttendance();
  if (section === "manage") renderManage();
}

function studentStats() {
  const users = getUsers().filter(u => u.role === "student");
  const avg = users.length ? Math.round(users.reduce((s, u) => s + (Number(u.marks) || 0), 0) / users.length) : 0;
  return { count: users.length, avg };
}

function renderOverview() {
  const u = currentUser;
  if (u.role === "admin") {
    const s = studentStats(), users = getUsers().filter(x => x.role === "student");
    $("dashboard-content").innerHTML = `
    <section class="welcome-banner"><div><h2>Welcome back, Administrator 👋</h2><p>Manage student records and keep academic information up to date.</p></div><div class="welcome-id"><span>ACCESS LEVEL</span><strong>Administrator</strong></div></section>
    <div class="stats-grid"><div class="stat-card"><div class="stat-head">Registered students <span class="stat-icon">♙</span></div><div class="stat-value">${s.count}</div><div class="stat-foot">Student accounts in this demo</div></div><div class="stat-card"><div class="stat-head">Average marks <span class="stat-icon">▥</span></div><div class="stat-value">${s.avg}%</div><div class="stat-foot">Across student demo records</div></div><div class="stat-card"><div class="stat-head">Courses <span class="stat-icon">▤</span></div><div class="stat-value">${new Set(users.map(x => x.course)).size}</div><div class="stat-foot">Courses represented</div></div><div class="stat-card"><div class="stat-head">Portal status <span class="stat-icon">✓</span></div><div class="stat-value" style="font-size:20px">Active</div><div class="stat-foot good">Demo running locally in browser</div></div></div>
    <section class="panel"><div class="panel-heading"><h3>Quick actions</h3><span>Administrator tools</span></div><p class="muted">Open Manage Students to search, inspect, edit or remove a student record. You can also create a student account from the sign-up screen.</p><button class="primary-btn" style="max-width:210px" onclick="renderSection('manage')">Manage Students <span>→</span></button></section>`;
  } else {
    const attendance = Number(u.attendance) || 0, marks = Number(u.marks) || 0;
    $("dashboard-content").innerHTML = `
    <section class="welcome-banner"><div><h2>Welcome back, ${escapeHtml(u.name.split(" ")[0])} 👋</h2><p>Here is a snapshot of your academic journey. Keep up the steady progress.</p></div><div class="welcome-id"><span>PERMANENT STUDENT ID</span><strong>${escapeHtml(u.id)}</strong></div></section>
    <div class="stats-grid"><div class="stat-card"><div class="stat-head">Attendance <span class="stat-icon">◷</span></div><div class="stat-value">${attendance}%</div><div class="stat-foot ${attendance >= 75 ? "good" : ""}">${attendance >= 75 ? "Above 75% threshold" : "Below 75% threshold"}</div></div><div class="stat-card"><div class="stat-head">Average marks <span class="stat-icon">▥</span></div><div class="stat-value">${marks}%</div><div class="stat-foot good">Academic performance</div></div><div class="stat-card"><div class="stat-head">Academic year <span class="stat-icon">▤</span></div><div class="stat-value" style="font-size:19px">${escapeHtml(u.year || "Not assigned")}</div><div class="stat-foot">Current enrolment</div></div><div class="stat-card"><div class="stat-head">Course <span class="stat-icon">⌂</span></div><div class="stat-value" style="font-size:15px;line-height:1.4">${escapeHtml(shortCourse(u.course))}</div><div class="stat-foot">Enrolled programme</div></div></div>
    <div class="section-grid"><section class="panel"><div class="panel-heading"><h3>Subject performance</h3><span>Marks out of 100</span></div>${(u.subjects || []).length ? (u.subjects || []).map(s => `<div class="progress-row"><strong>${escapeHtml(s[0])}</strong><span>${s[1]}%</span><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0, Math.min(100, Number(s[1]) || 0))}%"></div></div></div>`).join("") : '<div class="empty-state">Your subject marks have not been added yet.</div>'}</section>
    <section class="panel"><div class="panel-heading"><h3>At a glance</h3><span>Profile summary</span></div><div class="activity-list"><div class="activity"><div class="activity-icon">✓</div><div><strong>Account active</strong><p>Your student account is ready to use.</p></div></div><div class="activity"><div class="activity-icon">▤</div><div><strong>${escapeHtml(u.course || "Course not assigned")}</strong><p>${escapeHtml(u.className || "Class not assigned")} · ${escapeHtml(u.year || "Year not assigned")}</p></div></div><div class="activity"><div class="activity-icon">◷</div><div><strong>${attendance}% attendance</strong><p>${attendance >= 75 ? "You are currently above the 75% reference threshold." : "Check your attendance and contact your faculty if needed."}</p></div></div></div></section></div>`;
  }
}

function shortCourse(course) { return (course || "Not assigned").replace("B.Tech Information Technology", "B.Tech IT").replace("Bachelor of Computer Applications", "BCA").replace("B.Sc Computer Science", "B.Sc CS"); }
function pair(label, value) { return `<div class="data-pair"><span>${label}</span><strong>${escapeHtml(value || "Not provided")}</strong></div>`; }

function renderProfile() {
  const u = currentUser;
  if (u.role === "admin") {
    $("dashboard-content").innerHTML = '<section class="panel"><h3 class="section-title">Administrator Profile</h3><p class="muted">You are signed in with administrator access. Student personal records are available under Manage Students.</p>' + pair("Account ID", u.id) + pair("Email", u.email) + pair("Role", "Administrator") + '</section>';
    return;
  }
  $("dashboard-content").innerHTML = `<div class="details-grid"><section class="detail-card"><h3>Personal Information</h3>${pair("Full name", u.name)}${pair("Permanent Student ID", u.id)}${pair("Date of birth", u.dob)}${pair("Age", u.age ? u.age + " years" : "Not provided")}${pair("Email address", u.email)}${pair("Phone number", u.phone)}</section><section class="detail-card"><h3>Family & Contact</h3>${pair("Parent / guardian", u.parents)}${pair("Address", u.address)}${pair("Blood group", u.bloodGroup)}${pair("Medical information", u.medical)}</section></div><p class="muted" style="margin-top:15px">For this demo, profile details are sample data stored in this browser. Do not enter real medical or sensitive personal information.</p>`;
}

function renderAcademics() {
  const u = currentUser;
  if (u.role === "admin") {
    $("dashboard-content").innerHTML = '<section class="panel"><h3 class="section-title">Academic Records</h3><p class="muted">Use Manage Students to review each student’s academic profile.</p></section>';
    return;
  }
  const subjects = u.subjects || [];
  $("dashboard-content").innerHTML = `<section class="welcome-banner"><div><h2>${escapeHtml(u.course || "Course not assigned")}</h2><p>${escapeHtml(u.year || "Year not assigned")} · Class ${escapeHtml(u.className || "Not assigned")}</p></div><div class="welcome-id"><span>AVERAGE MARKS</span><strong>${Number(u.marks) || 0}%</strong></div></section><section class="panel" style="margin-top:16px"><div class="panel-heading"><h3>Subject-wise results</h3><span>Demo academic data</span></div>${subjects.length ? `<div class="table-wrap"><table><thead><tr><th>SUBJECT</th><th>MARKS</th><th>GRADE</th><th>PROGRESS</th></tr></thead><tbody>${subjects.map(s => `<tr><td><strong>${escapeHtml(s[0])}</strong></td><td>${s[1]}/100</td><td><span class="pill">${s[1] >= 90 ? "A+" : s[1] >= 80 ? "A" : s[1] >= 70 ? "B" : "C"}</span></td><td><div class="progress-track" style="width:100px"><div class="progress-fill" style="width:${s[1]}%"></div></div></td></tr>`).join("")}</tbody></table></div>` : '<div class="empty-state">No subject results are available yet.</div>'}</section>`;
}

function renderAttendance() {
  const u = currentUser;
  if (u.role === "admin") {
    $("dashboard-content").innerHTML = '<section class="panel"><h3 class="section-title">Attendance Overview</h3><p class="muted">Select Manage Students to review student attendance percentages.</p></section>';
    return;
  }
  const a = Number(u.attendance) || 0;
  $("dashboard-content").innerHTML = `<div class="details-grid"><section class="detail-card"><h3>Overall Attendance</h3><div style="display:flex;align-items:center;gap:20px;padding:10px 0 20px"><div style="width:112px;height:112px;border-radius:50%;background:conic-gradient(#5369e9 ${a * 3.6}deg,#edf0f8 0);display:grid;place-items:center;flex-shrink:0"><div style="width:84px;height:84px;border-radius:50%;background:white;display:grid;place-items:center;font-size:22px;font-weight:800">${a}%</div></div><div><strong style="font-size:13px">${a >= 75 ? "Attendance target met" : "Attendance needs attention"}</strong><p class="muted" style="margin:7px 0 0">75% is used as a reference threshold in this demo.</p></div></div><div class="progress-track"><div class="progress-fill" style="width:${a}%"></div></div></section><section class="detail-card"><h3>Attendance Information</h3>${pair("Student ID", u.id)}${pair("Course", u.course)}${pair("Class", u.className)}${pair("Current attendance", a + "%")}${pair("Status", a >= 75 ? "On track" : "Needs attention")}</section></div><section class="panel" style="margin-top:15px"><h3 class="section-title">Attendance note</h3><p class="muted" style="margin:0">The attendance percentage is prefilled sample data. A production version would record each class session and calculate the percentage from verified attendance entries.</p></section>`;
}

function renderManage() {
  const students = getUsers().filter(u => u.role === "student");
  $("dashboard-content").innerHTML = `<section class="welcome-banner"><div><h2>Student Records</h2><p>Search, inspect, edit or remove demo student accounts.</p></div><div class="welcome-id"><span>TOTAL STUDENTS</span><strong>${students.length}</strong></div></section><section style="margin-top:18px"><input id="student-search" class="table-search" placeholder="Search by name, ID, course or email..." aria-label="Search students"><div id="student-table"></div></section>`;
  $("student-search").addEventListener("input", drawStudentTable);
  drawStudentTable();
}

function drawStudentTable() {
  const q = ($("student-search")?.value || "").toLowerCase();
  const students = getUsers().filter(u => u.role === "student" && [u.name, u.id, u.email, u.course].some(v => String(v || "").toLowerCase().includes(q)));
  $("student-table").innerHTML = students.length ? `<div class="table-wrap"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>COURSE</th><th>ATTENDANCE</th><th>MARKS</th><th>ACTIONS</th></tr></thead><tbody>${students.map(u => `<tr><td><strong>${escapeHtml(u.name)}</strong><br><span style="color:#8994a8;font-size:10px">${escapeHtml(u.email)}</span></td><td>${escapeHtml(u.id)}</td><td>${escapeHtml(shortCourse(u.course))}</td><td>${Number(u.attendance) \vert{}\vert{} 0}\%</td><td>${Number(u.marks) || 0}%</td><td><div class="admin-actions"><button class="small-btn" data-view="${escapeHtml(u.id)}">View</button><button class="small-btn" data-edit="${escapeHtml(u.id)}">Edit</button><b
