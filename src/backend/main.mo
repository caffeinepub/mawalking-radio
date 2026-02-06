import OutCall "http-outcalls/outcall";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile System
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Push Notification System
  type PushSubscription = {
    endpoint : Text;
    auth : Text;
    p256dh : Text;
  };

  let radioStreamUrl = "https://www.mawalkingradio.app/listen/mawalking_radio/mawalkingRhumba";
  let checkIntervalSeconds = 60;
  let requests = List.empty<(Time.Time, Text)>();

  // Store subscription details mapped by Principal
  let pushSubscriptions = Map.empty<Principal, PushSubscription>();

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func getRadioStreamUrl() : async Text {
    radioStreamUrl;
  };

  public func checkRadioStreamAvailability() : async Bool {
    let response = await OutCall.httpGetRequest(radioStreamUrl, [], transform);
    response.size() > 0;
  };

  public shared ({ caller }) func saveRequest(requestText : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save requests");
    };
    let timestamp = Time.now();
    requests.add((timestamp, requestText));
  };

  public query ({ caller }) func getRequests() : async [(Time.Time, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view requests");
    };
    requests.toArray();
  };

  public query ({ caller }) func getCheckIntervalSeconds() : async Nat {
    checkIntervalSeconds;
  };

  public shared ({ caller }) func storePushSubscription(endpoint : Text, auth : Text, p256dh : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can store push subscriptions");
    };
    if (endpoint == "" or auth == "" or p256dh == "") {
      Runtime.trap("All subscription fields must be provided");
    };
    let subscription : PushSubscription = {
      endpoint;
      auth;
      p256dh;
    };
    pushSubscriptions.add(caller, subscription);
  };

  public query ({ caller }) func getPushSubscription() : async ?PushSubscription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access push subscriptions");
    };
    pushSubscriptions.get(caller);
  };

  public query ({ caller }) func getAllPushSubscriptions() : async [(Principal, PushSubscription)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all subscriptions");
    };
    pushSubscriptions.toArray();
  };
};
