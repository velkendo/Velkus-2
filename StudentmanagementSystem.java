import java.util.*;

/**
 * StudentSphere Console Demo
 * Companion program for offline or online Java execution.
 */
public class StudentManagementSystem {
    static class Student {
        String id, name, email, course, year;
        int attendance, marks;
        Student(String id, String name, String email, String course, String year, int attendance, int marks) {
            this.id=id; this.name=name; this.email=email; this.course=course; this.year=year;
            this.attendance=attendance; this.marks=marks;
        }
        void show() {
            System.out.println("\nStudent ID : " + id);
            System.out.println("Name       : " + name);
            System.out.println("Email      : " + email);
            System.out.println("Course     : " + course);
            System.out.println("Year       : " + year);
            System.out.println("Attendance : " + attendance + "%");
            System.out.println("Marks      : " + marks + "%");
        }
    }
    
    static final Scanner in = new Scanner(System.in);
    static final List<Student> students = new ArrayList<>();
    static int nextId = 3;

    public static void main(String[] args) {
        students.add(new Student("STU20260001","Aanya Sharma","aanya@example.com","B.Tech Information Technology","Second Year",92,86));
        students.add(new Student("STU20260002","Arjun Mehta","arjun@example.com","B.Sc Computer Science","First Year",84,78));
        
        while (true) {
            System.out.println("\n======================================");
            System.out.println("       STUDENTSPHERE PORTAL");
            System.out.println("======================================");
            System.out.println("1. Student Login");
            System.out.println("2. Admin Login");
            System.out.println("3. Student Sign Up");
            System.out.println("0. Exit");
            System.out.print("Choose an option: ");
            String choice = in.nextLine().trim();
            switch (choice) {
                case "1": studentLogin(); break;
                case "2": adminLogin(); break;
                case "3": signUp(); break;
                case "0": System.out.println("Thank you for using StudentSphere!"); return;
                default: System.out.println("Invalid option. Please try again.");
            }
        }
    }

    static void studentLogin() {
        System.out.print("Student ID: ");
        String id = in.nextLine().trim();
        System.out.print("Password (demo password: student123): ");
        String password = in.nextLine();
        if (!password.equals("student123")) { System.out.println("Invalid login."); return; }
        for (Student s : students) {
            if (s.id.equalsIgnoreCase(id)) { studentMenu(s); return; }
        }
        System.out.println("Student not found.");
    }

    static void studentMenu(Student s) {
        while (true) {
            System.out.println("\n--- STUDENT DASHBOARD ---");
            System.out.println("1. Personal and Academic Details");
            System.out.println("2. Attendance and Progress");
            System.out.println("0. Logout");
            System.out.print("Choose an option: ");
            String choice = in.nextLine().trim();
            if (choice.equals("1")) s.show();
            else if (choice.equals("2")) {
                System.out.println("Attendance: " + s.attendance + "%");
                System.out.println("Average marks: " + s.marks + "%");
            } else if (choice.equals("0")) return;
            else System.out.println("Invalid option.");
        }
    }

    static void adminLogin() {
        System.out.print("Admin ID: ");
        String id = in.nextLine().trim();
        System.out.print("Password: ");
        String password = in.nextLine();
        if (!id.equalsIgnoreCase("ADMIN001") || !password.equals("admin123")) {
            System.out.println("Invalid admin login."); return;
        }
        while (true) {
            System.out.println("\n--- ADMIN DASHBOARD ---");
            System.out.println("1. List students");
            System.out.println("2. Search student by ID");
            System.out.println("0. Logout");
            System.out.print("Choose an option: ");
            String choice = in.nextLine().trim();
            switch (choice) {
                case "1":
                    if (students.isEmpty()) System.out.println("No student records.");
                    for (Student s : students) System.out.println(s.id + " | " + s.name + " | " + s.course);
                    break;
                case "2":
                    System.out.print("Enter Student ID: ");
                    String sId = in.nextLine().trim();
                    Student found = find(sId);
                    if (found == null) System.out.println("Student not found."); else found.show();
                    break;
                case "0": return;
                default: System.out.println("Invalid option.");
            }
        }
    }

    static void signUp() {
        System.out.print("Full name: "); String name = in.nextLine().trim();
        System.out.print("Email: "); String email = in.nextLine().trim();
        if (name.isEmpty() || email.isEmpty() || !email.contains("@")) {
            System.out.println("Please enter a name and valid email."); return;
        }
        String id = "STU" + Calendar.getInstance().get(Calendar.YEAR) + String.format("%04d", nextId++);
        System.out.print("Course: "); String course = in.nextLine().trim();
        System.out.print("Academic year: "); String year = in.nextLine().trim();
        students.add(new Student(id, name, email, course, year, 0, 0));
        System.out.println("\nAccount created! Permanent ID: " + id);
    }

    static Student find(String id) {
        for (Student s : students) if (s.id.equalsIgnoreCase(id)) return s;
        return null;
    }
}
