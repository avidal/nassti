"use strict";

const tickPatterns = [
  /The day has begun.$/,
  /The sun rises/,
  /The sun sets.$/,
  /You suddenly feel less protected.$/,
  /Your heartbeat calms down more as you feel less panicked.$/,
  /The night has begun.$/,
  /is about to go out!$/,
  /A .* is definitely fading.$/,
  /has gone out!$/,
  /You move slightly, settling your cloak into position.$/,
  /As you watch .* seems to melt into the background, vanishing.$/,
  /The rising sun casts both warm light and long shadows across the mountains.$/,
  /The piercing rays of dawn peek above the eastern horizon.$/,
  /The sun peeks over the topless towers of the city.$/,
  /An orange glow covers the grassland as the sun slowly sinks into the horizon.$/,
  /A shadow is cast over the land as the sun vanishes beyond Garen's Wall.$/,
  /The sun's first rays touch the eastern slopes of Garen's Wall.$/,
  /Radiant hues permeate the horizon as the sun sinks in the west.$/,
  /A ball of red light rises slowly from the edge of the grassland, bringing light to the savannah.$/,
  /Light begins to peak from behind the hills.$/,
  /The sun sinks slowly beneath the rolling hills to the west.$/,
  /Shadows lengthen as the sun approaches the horizon.$/,
  /Morning dew glitters in the days first sunrays.$/,
  /The Wheel of Time spins/,
  /The Wheel of Time turns toward/,
  /A glowing portal fades from existence.$/,
  /The sun sinks below the western horizon.$/,
  /The corpse of .* has decayed into a pile of dust.$/,
  /.* begins to dim a little.$/,
  /Your white aura has faded.$/,
  /The sun drops quickly in the west in a glory of color.$/,
  /As the sky burns in shades of fushia and gold the sun sets in the west.$/,
  /The sun begins its journey to its peak in the sky.$/,
  /Shadows embrace the city as twilight falls over Seandar.$/,
  /The clouds in the east burn pink and violet with the rising of the sun.$/,
  /You feel parched from the hot weather.$/,
  /Low deep bronze tones fill the air as a wind blows from the north.$/,
  /Darkness gently falls as the sun slips behind the rolling hills.$/,
  /A warm glow is cast by the rising sun.$/,
  /The last rays of light burn red against the foothills.$/,
  /The sun slowly rises above the plains.$/,
  /Shadows descend upon the land as the sun drops behind the hills to the west.$/,
  /The dust of the plains in the air turns golden with the falling hush of dusk.$/,
  /A warm glow bathes the Illian road in a bright light.$/,
  /.* disappears into the void.$/,
  /The nocturnal sounds of the forest begin to rise as the sun sets in the west.$/,
  /Thin rays of sunlight pierce the sky over the marshes.$/,
  /Shadows grow beneath the peaks as dusk arrives.$/,
  /The suns golden rays glisten over the Aryth ocean as it rises.$/,
  /The sun falls slowly behind the walls of the city.$/,
  /The sun slowly sinks in the west, casting long shadows across the city.$/,
  /You feel your extra strength fading.$/,
  /A harsh light emerges as the sun rises.$/,
  /The sun bursts into the eastern skies.$/,
  /As if by a painter's brush, the sun sets in a sky of violet, red, and blue.$/,
  /Light breaks over the horizon through waves of heat as a new day begins.$/,
  /The sky glows with the rising of the sun.$/,
  /The sun begins to cast an orange glow on the trees as it rises.$/,
  /The sun sinks behind the western wall of the city.$/,
  /The tall towers above you shimmer brightly in the light of the rising sun.$/,
  /The sun sets behind the Spine of the World.$/,
  /The sun starts to rise above the walls of the city.$/,
  /The darkness turns to a bright haze as the sun breaks the horizon to the east.$/,
  /Dew settles on the grasslands as darkness descends.$/,
  /The lilac blue of dawn begins to grace the sky from the east.$/,
  /Heatwaves shimmer as the blistering sun arcs into the sky.$/,
  /The blazing hot sun sinks beneath the horizon of the Waste.$/,
  /The sun crests the horizon and light breaks through the trees.$/,
  /The sky glows with subdued light as the sun dips below the horizon.$/,
  /The sky turns red as a fiery sun sets in the west.$/,
  /The sky turns orange and pink as the sun sinks into the Aryth Ocean.$/,
  /The sun's blinding light is reflected in the lakes waters as it sets.$/,
  /Golden rays of sunshine peek over the hills of the surrounding countryside.$/,
  /Dew settles on the ground as the sun sets west of the mountains.$/,
  /The blazing sun fades into greyness behind the towers.$/,
  /The golden sun sinks down behind the rugged hills.$/,
  /Ruddy amber hues streak across the vanishing horizon as night falls.$/,
  /The sun sets behind the city's western wall.$/,
  /The sun sinks into the hills.$/,
  /The sunlight sweeps across the plains with the dawn.$/,
  /The world is submerged into coolness as the sun sinks into the horizon.$/,
  /As the sun lowers beneath the horizon, a gloomy darkness descends on the long road.$/,
  /The sun casts its yellow light over the long road.$/,
  /The sun slowly descends behind the hills.$/,
  /Light fades as the red evening sun slowly drops below the horizon.$/,
  /Vivid colors flood the sky as the sun sets over the hills.$/
];

module.exports = function(ticklen) {
  ticklen = ticklen || 70;

  return function(session) {
    // Create a timer named tick with a default 70 second interval.
    let ticker = session.timer("tick", ticklen, function() {
      session.emit("tick");
    });

    // And register a trigger for each pattern that, when matched, will reset and
    // fire the ticker
    let pattern;
    for(pattern of tickPatterns) {
      session.trigger(pattern, function() {
        // Reset the ticker
        ticker.reset();
        // And fire it immediately, since a tick just occurred
        ticker.fire();
      });
    }
  };

};
