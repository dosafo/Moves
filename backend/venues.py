from dataclasses import dataclass, field


@dataclass
class Venue:
    id: str
    name: str
    type: str
    neighborhood: str
    city: str
    address: str
    vibes: list[str]
    music_styles: list[str]
    price_level: int  # 1 ($) → 4 ($$$$)
    description: str
    good_for: list[str]  # e.g. ["solo", "date", "small group", "large group"]


CATALOG: list[Venue] = [
    Venue(
        id="vinyl-room",
        name="The Vinyl Room",
        type="bar",
        neighborhood="Wicker Park",
        city="Chicago",
        address="1631 N Milwaukee Ave",
        vibes=["laid-back", "intimate", "artsy"],
        music_styles=["jazz", "soul", "hip-hop"],
        price_level=2,
        description="A low-key listening bar built around a serious vinyl collection. Dark booths, no TVs, and a crowd that actually talks to each other.",
        good_for=["date", "small group", "solo"],
    ),
    Venue(
        id="green-mill",
        name="Green Mill Cocktail Lounge",
        type="jazz club",
        neighborhood="Uptown",
        city="Chicago",
        address="4802 N Broadway",
        vibes=["classic", "intimate", "old-school"],
        music_styles=["jazz", "blues"],
        price_level=2,
        description="Chicago's oldest jazz club, operating since 1907. Live jazz every night, original Al Capone-era booths, and a no-nonsense crowd.",
        good_for=["date", "small group"],
    ),
    Venue(
        id="intelligentsia-millenium",
        name="Intelligentsia Coffee (Millennium Park)",
        type="coffee shop",
        neighborhood="The Loop",
        city="Chicago",
        address="53 W Jackson Blvd",
        vibes=["bright", "focused", "social"],
        music_styles=[],
        price_level=2,
        description="Specialty coffee in a high-ceiling space steps from Millennium Park. Great for working or a quick catch-up.",
        good_for=["solo", "small group"],
    ),
    Venue(
        id="hopewell-brewing",
        name="Hopewell Brewing Co.",
        type="brewery",
        neighborhood="Logan Square",
        city="Chicago",
        address="2760 N Milwaukee Ave",
        vibes=["lively", "social", "casual"],
        music_styles=["indie", "pop"],
        price_level=2,
        description="A neighbourhood brewery with a friendly taproom, long communal tables, and rotating seasonal beers. Loud-ish but not overbearing.",
        good_for=["small group", "large group"],
    ),
    Venue(
        id="lost-l-lounge",
        name="The Lost L Lounge",
        type="dive bar",
        neighborhood="Bucktown",
        city="Chicago",
        address="1001 N Damen Ave",
        vibes=["unpretentious", "chill", "neighbourhood"],
        music_styles=["rock", "indie"],
        price_level=1,
        description="A proper dive with $4 Old Styles, a good jukebox, and absolutely no pretension. The regulars are friendly.",
        good_for=["solo", "small group"],
    ),
    Venue(
        id="soho-house-chicago",
        name="Soho House Chicago (Rooftop)",
        type="rooftop bar",
        neighborhood="West Loop",
        city="Chicago",
        address="113-125 N Green St",
        vibes=["upscale", "social", "stylish"],
        music_styles=["house", "R&B"],
        price_level=4,
        description="Members-only rooftop with pool and skyline views — but the bar is accessible with a member. Worth it for a special occasion.",
        good_for=["date", "small group", "large group"],
    ),
    Venue(
        id="logan-square-farmers",
        name="Logan Square Farmers Market",
        type="outdoor market",
        neighborhood="Logan Square",
        city="Chicago",
        address="Logan Blvd & Milwaukee Ave",
        vibes=["relaxed", "community", "daytime"],
        music_styles=[],
        price_level=1,
        description="Sunday morning outdoor market with local produce, street food, and a neighbourhood vibe. Perfect for a casual weekend morning.",
        good_for=["family", "small group", "solo"],
    ),
    Venue(
        id="berlin-nightclub",
        name="Berlin Nightclub",
        type="nightclub",
        neighborhood="Boystown",
        city="Chicago",
        address="954 W Belmont Ave",
        vibes=["energetic", "inclusive", "late-night"],
        music_styles=["house", "techno", "pop"],
        price_level=2,
        description="A legendary LGBTQ+ club that's been a Chicago institution since 1983. Unpretentious, sweaty, and fun until 4am.",
        good_for=["large group", "small group"],
    ),
    Venue(
        id="promontory",
        name="The Promontory",
        type="live music venue",
        neighborhood="Hyde Park",
        city="Chicago",
        address="5311 S Lake Park Ave W",
        vibes=["sophisticated", "lively", "cultural"],
        music_styles=["jazz", "soul", "R&B", "indie"],
        price_level=3,
        description="A multi-level venue with a restaurant, bar, and live music stage. South Side staple with a diverse crowd and great programming.",
        good_for=["date", "small group", "large group"],
    ),
    Venue(
        id="dollar-bill-oysters",
        name="Dollar Bill Oysters",
        type="oyster bar",
        neighborhood="River North",
        city="Chicago",
        address="9 W Hubbard St",
        vibes=["lively", "social", "festive"],
        music_styles=["pop", "R&B"],
        price_level=3,
        description="$1 oysters during happy hour, strong cocktails, and a party-ready crowd. Great for celebrating or just treating yourself mid-week.",
        good_for=["date", "small group", "large group"],
    ),
    Venue(
        id="montrose-beach",
        name="Montrose Beach",
        type="park / beach",
        neighborhood="Uptown",
        city="Chicago",
        address="4400 N Lake Shore Dr",
        vibes=["relaxed", "outdoor", "scenic"],
        music_styles=[],
        price_level=1,
        description="Chicago's best beach: a dog beach, volleyball courts, and a long stretch of sand facing the lake. Sunset views are unbeatable.",
        good_for=["family", "large group", "small group", "solo"],
    ),
    Venue(
        id="avondale-social-club",
        name="Avondale Social Club",
        type="cocktail bar",
        neighborhood="Avondale",
        city="Chicago",
        address="3445 W Addison St",
        vibes=["neighbourhood", "warm", "low-key"],
        music_styles=["indie", "jazz"],
        price_level=2,
        description="A cosy neighbourhood cocktail bar with creative drinks and no attitude. Softer lighting, good music at a reasonable volume.",
        good_for=["date", "small group"],
    ),
    Venue(
        id="penumbra-coffee",
        name="Penumbra Coffee",
        type="coffee shop",
        neighborhood="Pilsen",
        city="Chicago",
        address="1839 S Carpenter St",
        vibes=["artsy", "quiet", "focused"],
        music_styles=[],
        price_level=2,
        description="Tucked in Pilsen's gallery district, this small-batch roaster draws local artists and remote workers. Very chill, rarely crowded.",
        good_for=["solo", "small group"],
    ),
    Venue(
        id="old-town-pub",
        name="Old Town Ale House",
        type="bar",
        neighborhood="Old Town",
        city="Chicago",
        address="219 W North Ave",
        vibes=["eccentric", "classic", "neighbourhood"],
        music_styles=["jazz", "blues"],
        price_level=1,
        description="A legendary dive bar famous for its owner's uncensored murals, cheap beers, and a cast of regulars unlike anywhere else in the city.",
        good_for=["solo", "small group"],
    ),
    Venue(
        id="spybar",
        name="Spybar",
        type="nightclub",
        neighborhood="River North",
        city="Chicago",
        address="646 N Franklin St",
        vibes=["underground", "energetic", "late-night"],
        music_styles=["techno", "house"],
        price_level=3,
        description="A basement club with a serious sound system and a crowd that's here for the music. Proper house and techno DJs, dark lighting.",
        good_for=["small group", "large group"],
    ),
]

_catalog_by_id: dict[str, Venue] = {v.id: v for v in CATALOG}


def get_venue_by_id(venue_id: str) -> Venue | None: #returns the venue by its id if it exists in the catalog
    return _catalog_by_id.get(venue_id)


def filter_catalog(location: str | None) -> list[Venue]:
    """Return venues matching the location string, or full catalog if no match."""
    if not location: #if no location filter is provided, return the full catalog
        return CATALOG

    loc = location.lower()
    matched = [
        v for v in CATALOG #extract venues from the catalog if the location is found in the city or neighborhood
        if loc in v.city.lower() or loc in v.neighborhood.lower()
    ]
    # Fall back to full catalog rather than returning zero results.
    # An empty catalog filter is a data coverage gap, not a query failure.
    return matched if matched else CATALOG


def catalog_to_prompt_text(venues: list[Venue]) -> str:
    """Serialise venues to a numbered plain-text block for injection into the system prompt.

    Plain text outperforms raw JSON here: Claude was trained on prose documents,
    so labelled key-value lines read more naturally than dense JSON dicts.
    Computed once per filtered set, not per request.
    """
    lines: list[str] = []
    for i, v in enumerate(venues, 1):
        price_str = "$" * v.price_level
        lines.append(
            f"{i}. id: {v.id}\n"
            f"   name: {v.name}\n"
            f"   type: {v.type}\n"
            f"   neighborhood: {v.neighborhood}, {v.city}\n"
            f"   address: {v.address}\n"
            f"   vibes: {', '.join(v.vibes)}\n"
            f"   music: {', '.join(v.music_styles) or 'none'}\n"
            f"   price: {price_str}\n"
            f"   good for: {', '.join(v.good_for)}\n"
            f"   description: {v.description}"
        )
    return "\n\n".join(lines)
