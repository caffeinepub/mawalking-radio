import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";

import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import Nat64 "mo:core/Nat64";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import Int "mo:core/Int";

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
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  public shared ({ caller }) func checkRadioStreamAvailability() : async Bool {
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
    let subscription : PushSubscription = {
      endpoint;
      auth;
      p256dh;
    };
    pushSubscriptions.add(caller, subscription);
  };

  public query ({ caller }) func getPushSubscription() : async ?PushSubscription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view push subscriptions");
    };
    pushSubscriptions.get(caller);
  };

  public query ({ caller }) func getPushSubscriptionState() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check push subscription state");
    };
    pushSubscriptions.containsKey(caller);
  };

  public query ({ caller }) func getAllPushSubscriptions() : async [(Principal, PushSubscription)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all push subscriptions");
    };
    pushSubscriptions.toArray();
  };

  //---------------- Venue Backend Logic -------------------
  public type Address = {
    street : Text;
    city : Text;
    state : Text;
    country : Text;
    postal_code : ?Text;
    latitude : Float;
    longitude : Float;
  };

  public type VenueStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type LiveEvent = {
    title : Text;
    event_date : Int;
    start_time : Int;
    end_time : Int;
    description : Text;
    live_music : Bool;
    dance_floor : Bool;
    cover_charge : Bool;
  };

  public type Venue = {
    id : Text;
    name : Text;
    description : Text;
    address : Address;
    contact_info : Text;
    music_genre : Text;
    is_family_friendly : Bool;
    rating : Float;
    hours_of_operation : Text;
    amenities : [Text];
    website : Text;
    submitted_by : Text;
    date_submitted : Int;
    last_modified : Int;
    coordinator : Text;
    venue_type : Text;
    venue_status : Text;
    amenities_string : Text;
    approved : Bool;
    rejected : Bool;
    latitude : Text;
    longitude : Text;
    ac_logo : Text;
    map_url : Text;
    ven_map_url : Text;
    phone_number : Text;
    dancing : Text;
    weekly_events : Text;
    cover_charge : Text;
    group_discount : Text;
    highlight_quote : Text;
    event_calendar : Text;
    drink_discounts : Text;
    kitchen : Text;
  };

  public type WeeklyHours = {
    Monday : Text;
    Tuesday : Text;
    Wednesday : Text;
    Thursday : Text;
    Friday : Text;
    Saturday : Text;
    Sunday : Text;
  };

  public type OperationHoursResponse = {
    id : Text;
    hours_of_operation : WeeklyHours;
    holiday_hours : WeeklyHours;
    operation_hours_message : Text;
  };

  public type CapabilityResponse = {
    capabilities : {
      family_friendly : Text;
      live_music : Text;
      dance_floor : Text;
      // Other capabilities...
    };
    capabilities_message : Text;
  };

  public type VenueMapUrlResponse = {
    map_url : Text;
    venue_map_url : Text;
    ac_logo : Text;
    phone_number : Text;
    dancing : Text;
    weekly_events : Text;
    cover_charge : Text;
    group_discount : Text;
    highlight_quote : Text;
    event_calendar : Text;
    drink_discounts : Text;
    kitchen : Text;
  };

  let venues = Map.empty<Text, Venue>();
  let liveEvents = Map.empty<Text, LiveEvent>();
  let danceHalls = Map.empty<Text, Venue>();

  // Public query - no auth required
  public query ({ caller }) func getVenueInfoMessage() : async Text {
    "\nWelcome to RhumbaVenuesLiveKin! Find authentic Rhumba experiences across the US.\n\nTrusted Venues:\n- Curated for quality and cultural authenticity\n- Approved by our dedicated team (special shoutout to Ally Kondev (UR), Maurice Nishimwe (TX), and Folker Michaelsen (DC) for their contributions)\n- Includes both established venues and regular companies\n- Family-friendly options available\nLive Events:\n- Weekly, monthly, and special events\n- Detailed schedule and venue information\n- Follow your favorite places for updates\nUnique Features:\n- Full venue details (hours, guidelines, highlights)\n- Amenities, drink and snack options\n- Group discounts and event calendars\nHow It Works:\n1. Explore - Browse venues and events\n2. Experience - Enjoy authentic Rhumba\n3. Submit - Share your favorite venues\n";
  };

  // Public query - no auth required (only returns approved venues)
  public query ({ caller }) func getVenuesByLocationSorted(latitude : Float, longitude : Float, radius : Float) : async [Venue] {
    let filtered = venues.filter(
      func(_id, venue) {
        venue.venue_status == "approved" and distance(latitude, longitude, venue.address.latitude, venue.address.longitude) <= radius;
      }
    );
    let array = filtered.values().toArray();
    array.sort(
      func(venue1, venue2) {
        let distance1 = distance(latitude, longitude, venue1.address.latitude, venue1.address.longitude);
        let distance2 = distance(latitude, longitude, venue2.address.latitude, venue2.address.longitude);
        if (distance1 < distance2) { return #less };
        if (distance1 > distance2) { return #greater };
        #equal;
      }
    );
  };

  // Public query - no auth required (only returns events for approved venues)
  public query ({ caller }) func getLiveEventsToday(latitude : Float, longitude : Float, radius : Float) : async [LiveEvent] {
    let filtered = liveEvents.filter(
      func(_id, event) {
        switch (venues.get(event.title)) {
          case (?venue) {
            venue.venue_status == "approved" and eventDateMatchesToday(event) and distance(latitude, longitude, venue.address.latitude, venue.address.longitude) <= radius;
          };
          case null { false };
        };
      }
    );
    filtered.values().toArray();
  };

  // Public query - no auth required
  public query ({ caller }) func getApprovedVenues() : async [Venue] {
    venues.values().toArray().filter(
      func(venue) {
        venue.venue_status == "approved";
      }
    );
  };

  // User submission - requires user permission, sets status to pending
  public shared ({ caller }) func submitVenue(venue : Venue) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit venues");
    };

    // Force status to pending for user submissions
    let pendingVenue = {
      venue with
      venue_status = "pending";
      approved = false;
      rejected = false;
      submitted_by = caller.toText();
      date_submitted = Time.now();
      last_modified = Time.now();
    };

    venues.add(pendingVenue.id, pendingVenue);
  };

  // Admin only - get all venues including pending/rejected
  public query ({ caller }) func getAllVenues() : async [Venue] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all venues");
    };
    venues.values().toArray();
  };

  // Admin only - get pending venues for review
  public query ({ caller }) func getPendingVenues() : async [Venue] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending venues");
    };
    venues.values().toArray().filter(
      func(venue) {
        venue.venue_status == "pending";
      }
    );
  };

  // Admin only - approve venue
  public shared ({ caller }) func approveVenue(venueId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve venues");
    };

    switch (venues.get(venueId)) {
      case (?venue) {
        let approvedVenue = {
          venue with
          venue_status = "approved";
          approved = true;
          rejected = false;
          last_modified = Time.now();
        };
        venues.add(venueId, approvedVenue);
      };
      case null {
        Runtime.trap("Venue not found");
      };
    };
  };

  // Admin only - reject venue
  public shared ({ caller }) func rejectVenue(venueId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject venues");
    };

    switch (venues.get(venueId)) {
      case (?venue) {
        let rejectedVenue = {
          venue with
          venue_status = "rejected";
          approved = false;
          rejected = true;
          last_modified = Time.now();
        };
        venues.add(venueId, rejectedVenue);
      };
      case null {
        Runtime.trap("Venue not found");
      };
    };
  };

  // Admin only - edit venue
  public shared ({ caller }) func updateVenue(venueId : Text, updatedVenue : Venue) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update venues");
    };

    switch (venues.get(venueId)) {
      case (?_existingVenue) {
        let modifiedVenue = {
          updatedVenue with
          id = venueId;
          last_modified = Time.now();
        };
        venues.add(venueId, modifiedVenue);
      };
      case null {
        Runtime.trap("Venue not found");
      };
    };
  };

  // Admin only - remove venue
  public shared ({ caller }) func removeVenue(venueId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove venues");
    };

    switch (venues.get(venueId)) {
      case (?_venue) {
        venues.remove(venueId);
      };
      case null {
        Runtime.trap("Venue not found");
      };
    };
  };

  //---------------- Helper Functions ----------------------
  func distance(lat1 : Float, lon1 : Float, lat2 : Float, lon2 : Float) : Float {
    let earthRadius = 6371.0;
    let dLat = degreesToRadians(lat2 - lat1);
    let dLon = degreesToRadians(lon2 - lon1);

    let a = Float.pow(Float.sin(dLat / 2.0), 2.0) +
      Float.cos(degreesToRadians(lat1)) *
      Float.cos(degreesToRadians(lat2)) *
      Float.pow(Float.sin(dLon / 2.0), 2.0);
    let c = 2.0 * Float.arctan2(Float.sqrt(a), Float.sqrt(1.0 - a));
    earthRadius * c;
  };

  func degreesToRadians(degrees : Float) : Float {
    degrees * (3.141592653589793 / 180.0);
  };

  func eventDateMatchesToday(event : LiveEvent) : Bool {
    let currentTime = Time.now();
    let secondsInADay : Int = 86_400_000_000_000; // 24 hours in nanoseconds
    let startOfToday = (currentTime / secondsInADay) * secondsInADay;
    let endOfToday = startOfToday + secondsInADay;
    event.event_date >= startOfToday and event.event_date < endOfToday;
  };

  // Public query - no auth required (only returns approved venues)
  public query ({ caller }) func getVenueByCoordinates(lat : Text, long : Text) : async {
    venues : [Venue];
    message : Text;
  } {
    let filteredVenues = venues.values().toArray().filter(
      func(venue) {
        venue.venue_status == "approved" and venue.latitude == lat and venue.longitude == long;
      }
    );

    let message = if (filteredVenues.size() > 0) {
      filteredVenues[0].name.concat(" Located at: ").concat(lat).concat(", ").concat(long);
    } else {
      "No venues found at these coordinates. Check the venue map for more options.";
    };

    {
      venues = filteredVenues;
      message;
    };
  };

  // Public query - no auth required (only returns approved venues)
  public query ({ caller }) func getVenueByName(venueName : Text) : async {
    venues : [Venue];
    message : Text;
  } {
    let filteredVenues = venues.values().toArray().filter(
      func(venue) {
        venue.venue_status == "approved" and Text.equal(venue.name, venueName);
      }
    );

    let message = if (filteredVenues.size() > 0) {
      filteredVenues[0].name.concat(" at your service!");
    } else {
      "No matching venue found. Try providers page for more options.";
    };

    {
      venues = filteredVenues;
      message;
    };
  };

  // Allow bootstrapping the first admin if no existing admins
  public shared ({ caller }) func requestAdminRole() : async () {
    // Check if caller is already an admin
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("You are already an admin.");
    };

    // Check if any admins exist in the system
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      // If at least one admin exists, new admins can only be granted by existing admins
      Runtime.trap("An admin already exists. New admins must be granted by existing admins.");
    };

    // No existing admins found, allow the caller to become admin (initial bootstrap)
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };
};
