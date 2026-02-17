import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat32 "mo:core/Nat32";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  let institutions = Map.empty<Nat, Institution>();
  let students = Map.empty<Text, Student>();
  let sppSettings = Map.empty<Nat, SppSetting>();
  let payments = Map.empty<Nat, Payment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom role system for SPP application
  public type AppRole = {
    #superAdmin;
    #smpAdmin;
    #smaAdmin;
    #treasurer;
  };

  public type UserProfile = {
    name : Text;
    role : AppRole;
    institutionId : ?Nat; // null for SuperAdmin, set for institution-scoped roles
  };

  type ClassLevel = { #VII; #VIII; #IX; #Kelas10; #Kelas11; #Kelas12 };
  module ClassLevel {
    public func compare(l1 : ClassLevel, l2 : ClassLevel) : Order.Order {
      func toNat(c : ClassLevel) : Nat {
        switch (c) {
          case (#VII) { 0 };
          case (#VIII) { 1 };
          case (#IX) { 2 };
          case (#Kelas10) { 3 };
          case (#Kelas11) { 4 };
          case (#Kelas12) { 5 };
        };
      };
      Nat.compare(toNat(l1), toNat(l2));
    };
  };

  type PaymentMethod = { #cash; #transfer };
  type TagihanStatus = { #bayar; #belumBayar };
  type StatusSantri = { #bersekolah; #lulus };

  type Student = {
    nis : Text;
    classNumber : Nat;
    noInduk : Text;
    fullName : Text;
    institution : Institution;
    guardianName : Text;
    guardianPhone : Text;
    status : StatusSantri;
    enrollmentDate : Int;
  };

  module Student {
    public func compareByClass(student1 : Student, student2 : Student) : Order.Order {
      switch (Nat.compare(student1.classNumber, student2.classNumber)) {
        case (#equal) { Text.compare(student1.nis, student2.nis) };
        case (order) { order };
      };
    };
  };

  type Institution = {
    id : Nat;
    name : Text;
    address : Text;
  };

  module Institution {
    public func compare(inst1 : Institution, inst2 : Institution) : Order.Order {
      switch (Nat.compare(inst1.id, inst2.id)) {
        case (#equal) { Text.compare(inst1.name, inst2.name) };
        case (order) { order };
      };
    };
  };

  type SppSetting = {
    id : Nat;
    amount : Nat;
    brand : Text;
    date : Int;
    paymentMethod : PaymentMethod;
    receiptImage : Storage.ExternalBlob;
    notes : Text;
    institution : Institution;
    createdAt : Int;
  };

  module SppSetting {
    public func compare(setting1 : SppSetting, setting2 : SppSetting) : Order.Order {
      switch (Nat.compare(setting1.amount, setting2.amount)) {
        case (#equal) {
          switch (Text.compare(setting1.brand, setting2.brand)) {
            case (#equal) { Text.compare(setting1.notes, setting2.notes) };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type Payment = {
    institution : Institution;
    id : Nat;
    studentNis : Text;
    amount : Nat;
    brand : Text;
    date : Int;
    paymentMethod : PaymentMethod;
    receiptImage : Storage.ExternalBlob;
    notes : Text;
    createdAt : Int;
  };

  type CreatePaymentRequest = {
    id : Nat;
    studentNis : Text;
    amount : Nat;
    brand : Text;
    date : Int;
    paymentMethod : PaymentMethod;
    receiptImage : Storage.ExternalBlob;
    notes : Text;
    institutionId : Nat;
  };

  // Helper function to initialize default institutions only if not present.
  func ensureDefaultInstitutions() {
    let defaultInstitutions = [
      {
        id = 1;
        name = "SMP";
        address = "Default address for SMP";
      },
      {
        id = 2;
        name = "SMA";
        address = "Default address for SMA";
      },
    ];

    for (defaultInstitution in defaultInstitutions.values()) {
      switch (institutions.get(defaultInstitution.id)) {
        case (null) {
          institutions.add(defaultInstitution.id, defaultInstitution);
        };
        case (?_) {
          // If it exists, do not overwrite.
        };
      };
    };
  };

  // Authorization helper functions
  func assertAuthenticated(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
  };

  func getUserProfileOrTrap(caller : Principal) : UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: User profile not found") };
      case (?profile) { profile };
    };
  };

  func assertIsSuperAdmin(caller : Principal) {
    let profile = getUserProfileOrTrap(caller);
    switch (profile.role) {
      case (#superAdmin) {};
      case (_) { Runtime.trap("Unauthorized: Only Super Admin can perform this action") };
    };
  };

  func assertCanManageInstitution(caller : Principal, institutionId : Nat) {
    let profile = getUserProfileOrTrap(caller);
    switch (profile.role) {
      case (#superAdmin) {}; // Super admin can manage all institutions
      case (#smpAdmin or #smaAdmin or #treasurer) {
        switch (profile.institutionId) {
          case (null) { Runtime.trap("Unauthorized: Institution not assigned to user") };
          case (?userInstId) {
            if (userInstId != institutionId) {
              Runtime.trap("Unauthorized: Cannot access other institution's data");
            };
          };
        };
      };
    };
  };

  func assertCanModifyData(caller : Principal, institutionId : Nat) {
    let profile = getUserProfileOrTrap(caller);
    switch (profile.role) {
      case (#superAdmin) {}; // Can modify all
      case (#smpAdmin or #smaAdmin) {
        // Admins can modify their institution
        switch (profile.institutionId) {
          case (null) { Runtime.trap("Unauthorized: Institution not assigned") };
          case (?userInstId) {
            if (userInstId != institutionId) {
              Runtime.trap("Unauthorized: Cannot modify other institution's data");
            };
          };
        };
      };
      case (#treasurer) {
        Runtime.trap("Unauthorized: Treasurer role cannot modify master data");
      };
    };
  };

  func assertCanManagePayments(caller : Principal, institutionId : Nat) {
    let profile = getUserProfileOrTrap(caller);
    switch (profile.role) {
      case (#superAdmin) {}; // Can manage all payments
      case (#smpAdmin or #smaAdmin or #treasurer) {
        // All these roles can manage payments for their institution
        switch (profile.institutionId) {
          case (null) { Runtime.trap("Unauthorized: Institution not assigned") };
          case (?userInstId) {
            if (userInstId != institutionId) {
              Runtime.trap("Unauthorized: Cannot manage other institution's payments");
            };
          };
        };
      };
    };
  };

  func canViewInstitution(caller : Principal, institutionId : Nat) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#superAdmin) { true };
          case (_) {
            switch (profile.institutionId) {
              case (null) { false };
              case (?userInstId) { userInstId == institutionId };
            };
          };
        };
      };
    };
  };

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    assertAuthenticated(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    assertAuthenticated(caller);
    if (caller != user) {
      // Only super admin can view other users' profiles
      let profile = getUserProfileOrTrap(caller);
      switch (profile.role) {
        case (#superAdmin) {};
        case (_) { Runtime.trap("Unauthorized: Can only view your own profile") };
      };
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    assertAuthenticated(caller);

    // Validate institution assignment
    switch (profile.institutionId) {
      case (null) {
        // Only super admin can have null institution
        switch (profile.role) {
          case (#superAdmin) {};
          case (_) { Runtime.trap("Institution must be assigned for non-SuperAdmin roles") };
        };
      };
      case (?instId) {
        // Verify institution exists
        switch (institutions.get(instId)) {
          case (null) { Runtime.trap("Invalid institution ID") };
          case (?_) {};
        };
      };
    };

    userProfiles.add(caller, profile);
  };

  // Institution Management
  public shared ({ caller }) func addInstitution(name : Text, address : Text) : async Institution {
    assertIsSuperAdmin(caller);
    let id = institutions.size() + 1;
    let institution : Institution = {
      id;
      name;
      address;
    };
    institutions.add(id, institution);
    institution;
  };

  public query ({ caller }) func getInstitution(id : Nat) : async ?Institution {
    assertAuthenticated(caller);
    let inst = institutions.get(id);
    switch (inst) {
      case (null) { null };
      case (?i) {
        if (canViewInstitution(caller, id)) {
          ?i;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listInstitutions() : async [Institution] {
    // Must not require authentication as institution selector must work properly for not yet logged-in users and users without a user profile
    // When the user profile is set the client will filter the institutions based on user role/institution
    ensureDefaultInstitutions(); // This makes sure institution always shows the two default institutions
    institutions.values().toArray();
  };

  // Student Management
  public shared ({ caller }) func addStudent(
    nis : Text,
    classNumber : Nat,
    noInduk : Text,
    fullName : Text,
    instId : Nat,
    guardianName : Text,
    guardianPhone : Text,
    enrollmentDate : Int,
  ) : async Student {
    assertAuthenticated(caller);
    assertCanModifyData(caller, instId);

    let institution = switch (institutions.get(instId)) {
      case (null) { Runtime.trap("Institution not found") };
      case (?i) { i };
    };

    // Check if student already exists
    switch (students.get(nis)) {
      case (?_) { Runtime.trap("Student with this NIS already exists") };
      case (null) {};
    };

    let student = {
      nis;
      classNumber;
      noInduk;
      fullName;
      institution;
      guardianName;
      guardianPhone;
      status = #bersekolah;
      enrollmentDate;
    };
    students.add(nis, student);
    student;
  };

  public shared ({ caller }) func updateStudent(
    nis : Text,
    classNumber : Nat,
    fullName : Text,
    guardianName : Text,
    guardianPhone : Text,
  ) : async Student {
    assertAuthenticated(caller);

    let student = switch (students.get(nis)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    assertCanModifyData(caller, student.institution.id);

    let updatedStudent = {
      student with
      classNumber;
      fullName;
      guardianName;
      guardianPhone;
    };
    students.add(nis, updatedStudent);
    updatedStudent;
  };

  public shared ({ caller }) func updateStudentStatus(nis : Text, status : StatusSantri) : async Student {
    assertAuthenticated(caller);

    let student = switch (students.get(nis)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    assertCanModifyData(caller, student.institution.id);

    let updatedStudent = {
      student with status;
    };
    students.add(nis, updatedStudent);
    updatedStudent;
  };

  public shared ({ caller }) func deleteStudent(nis : Text) : async () {
    assertAuthenticated(caller);

    let student = switch (students.get(nis)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    assertCanModifyData(caller, student.institution.id);
    students.remove(nis);
  };

  public query ({ caller }) func getStudent(nis : Text) : async ?Student {
    assertAuthenticated(caller);

    let student = students.get(nis);
    switch (student) {
      case (null) { null };
      case (?s) {
        if (canViewInstitution(caller, s.institution.id)) {
          ?s;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listStudents(institutionId : ?Nat, status : ?StatusSantri) : async [Student] {
    assertAuthenticated(caller);

    let profile = getUserProfileOrTrap(caller);
    let allowedInstId = switch (profile.role) {
      case (#superAdmin) { institutionId };
      case (_) { profile.institutionId };
    };

    let filtered = students.values().filter(
        func(s : Student) : Bool {
          let instMatch = switch (allowedInstId) {
            case (null) { true };
            case (?id) { s.institution.id == id };
          };
          let statusMatch = switch (status) {
            case (null) { true };
            case (?st) { s.status == st };
          };
          instMatch and statusMatch;
        },
      ).toArray();
    filtered;
  };

  // SPP Settings Management
  public shared ({ caller }) func createSppSetting(
    amount : Nat,
    brand : Text,
    date : Int,
    paymentMethod : PaymentMethod,
    receiptImage : Storage.ExternalBlob,
    notes : Text,
    institutionId : Nat,
  ) : async SppSetting {
    assertAuthenticated(caller);
    assertCanModifyData(caller, institutionId);

    let institution = switch (institutions.get(institutionId)) {
      case (null) { Runtime.trap("Institution not found") };
      case (?i) { i };
    };

    let id = sppSettings.size() + 1;
    let setting : SppSetting = {
      id;
      amount;
      brand;
      date;
      paymentMethod;
      receiptImage;
      notes;
      institution;
      createdAt = Time.now();
    };
    sppSettings.add(id, setting);
    setting;
  };

  public shared ({ caller }) func updateSppSetting(
    id : Nat,
    amount : Nat,
    brand : Text,
    notes : Text,
  ) : async SppSetting {
    assertAuthenticated(caller);

    let setting = switch (sppSettings.get(id)) {
      case (null) { Runtime.trap("SPP setting not found") };
      case (?s) { s };
    };

    assertCanModifyData(caller, setting.institution.id);

    let updatedSetting = {
      setting with
      amount;
      brand;
      notes;
    };
    sppSettings.add(id, updatedSetting);
    updatedSetting;
  };

  public shared ({ caller }) func deleteSppSetting(id : Nat) : async () {
    assertAuthenticated(caller);

    let setting = switch (sppSettings.get(id)) {
      case (null) { Runtime.trap("SPP setting not found") };
      case (?s) { s };
    };

    assertCanModifyData(caller, setting.institution.id);
    sppSettings.remove(id);
  };

  public query ({ caller }) func getSppSetting(id : Nat) : async ?SppSetting {
    assertAuthenticated(caller);

    let setting = sppSettings.get(id);
    switch (setting) {
      case (null) { null };
      case (?s) {
        if (canViewInstitution(caller, s.institution.id)) {
          ?s;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listSppSettings(institutionId : ?Nat) : async [SppSetting] {
    assertAuthenticated(caller);

    let profile = getUserProfileOrTrap(caller);
    let allowedInstId = switch (profile.role) {
      case (#superAdmin) { institutionId };
      case (_) { profile.institutionId };
    };

    let filtered = sppSettings.values().filter(
        func(s : SppSetting) : Bool {
          switch (allowedInstId) {
            case (null) { true };
            case (?id) { s.institution.id == id };
          };
        },
      ).toArray();
    filtered;
  };

  // Payment Management
  public shared ({ caller }) func createPayment(request : CreatePaymentRequest) : async Payment {
    assertAuthenticated(caller);
    assertCanManagePayments(caller, request.institutionId);

    let institution = switch (institutions.get(request.institutionId)) {
      case (null) { Runtime.trap("Institution not found") };
      case (?i) { i };
    };

    // Verify student exists and belongs to the institution
    let student = switch (students.get(request.studentNis)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    if (student.institution.id != request.institutionId) {
      Runtime.trap("Student does not belong to the specified institution");
    };

    let payment : Payment = {
      institution;
      id = request.id;
      studentNis = request.studentNis;
      amount = request.amount;
      brand = request.brand;
      date = request.date;
      paymentMethod = request.paymentMethod;
      receiptImage = request.receiptImage;
      notes = request.notes;
      createdAt = Time.now();
    };
    payments.add(payment.id, payment);
    payment;
  };

  public shared ({ caller }) func updatePayment(
    id : Nat,
    amount : Nat,
    date : Int,
    paymentMethod : PaymentMethod,
    notes : Text,
  ) : async Payment {
    assertAuthenticated(caller);

    let payment = switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?p) { p };
    };

    assertCanManagePayments(caller, payment.institution.id);

    let updatedPayment = {
      payment with
      amount;
      date;
      paymentMethod;
      notes;
    };
    payments.add(id, updatedPayment);
    updatedPayment;
  };

  public shared ({ caller }) func deletePayment(paymentId : Nat) : async () {
    assertAuthenticated(caller);

    let payment = switch (payments.get(paymentId)) {
      case (null) { Runtime.trap("Payment not found") };
      case (?p) { p };
    };

    assertCanManagePayments(caller, payment.institution.id);
    payments.remove(paymentId);
  };

  public query ({ caller }) func getPayment(id : Nat) : async ?Payment {
    assertAuthenticated(caller);

    let payment = payments.get(id);
    switch (payment) {
      case (null) { null };
      case (?p) {
        if (canViewInstitution(caller, p.institution.id)) {
          ?p;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func listPayments(institutionId : ?Nat, studentNis : ?Text) : async [Payment] {
    assertAuthenticated(caller);

    let profile = getUserProfileOrTrap(caller);
    let allowedInstId = switch (profile.role) {
      case (#superAdmin) { institutionId };
      case (_) { profile.institutionId };
    };

    let filtered = payments.values().filter(
        func(p : Payment) : Bool {
          let instMatch = switch (allowedInstId) {
            case (null) { true };
            case (?id) { p.institution.id == id };
          };
          let studentMatch = switch (studentNis) {
            case (null) { true };
            case (?nis) { p.studentNis == nis };
          };
          instMatch and studentMatch;
        },
      ).toArray();
    filtered;
  };

  public query ({ caller }) func getStudentPaymentHistory(studentNis : Text) : async [Payment] {
    assertAuthenticated(caller);

    let student = switch (students.get(studentNis)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    if (not canViewInstitution(caller, student.institution.id)) {
      Runtime.trap("Unauthorized: Cannot view this student's payment history");
    };

    let filtered = payments.values().filter(
        func(p : Payment) : Bool {
          p.studentNis == studentNis;
        },
      ).toArray();
    filtered;
  };

  // Dashboard Statistics (read-only, institution-scoped)
  public query ({ caller }) func getDashboardStats() : async {
    totalSmpStudents : Nat;
    totalSmaStudents : Nat;
    totalPaymentsThisMonth : Nat;
    totalArrearsThisMonth : Nat;
  } {
    assertAuthenticated(caller);

    let profile = getUserProfileOrTrap(caller);
    let allowedInstId = profile.institutionId;

    // Filter students by institution
    let filteredStudents = students.values().filter(
        func(s : Student) : Bool {
          switch (allowedInstId) {
            case (null) { true }; // Super admin sees all
            case (?id) { s.institution.id == id };
          };
        },
      ).toArray();

    // Count SMP vs SMA students (placeholder logic - adjust based on actual institution names)
    var smpCount = 0;
    var smaCount = 0;
    for (student in filteredStudents.vals()) {
      if (student.institution.name.contains(#text "SMP")) {
        smpCount += 1;
      } else if (student.institution.name.contains(#text "SMA")) {
        smaCount += 1;
      };
    };

    // Calculate payments this month (placeholder - needs proper date filtering)
    let filteredPayments = payments.values().filter(
        func(p : Payment) : Bool {
          switch (allowedInstId) {
            case (null) { true };
            case (?id) { p.institution.id == id };
          };
        },
      ).toArray();

    {
      totalSmpStudents = smpCount;
      totalSmaStudents = smaCount;
      totalPaymentsThisMonth = filteredPayments.size();
      totalArrearsThisMonth = 0; // Placeholder - needs arrears calculation logic
    };
  };
};
