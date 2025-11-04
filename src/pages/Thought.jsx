import React from 'react';

const textBlocks = [
  `The sky above the port was the color of television, tuned to a dead channel. It was a Friday night in the city that was always nighttime. Rain slicked the streets, reflecting the neon signs that flickered and buzzed, promising everything and delivering nothing. A lone figure walked down the alley, collar turned up against the wind, a shadow among shadows. He was looking for something he had lost, something he wasn't even sure he ever had. The city was a maze, and he was a rat, running through its endless corridors, searching for a piece of cheese that was probably a lie. In the world of ones and zeros, everything was simple. Binary, absolute. Yes or no. True or false. There were no shades of gray, no maybes, no almosts. But life wasn't binary. Life was a messy, complicated, analog signal, full of noise and interference. He remembered a time when things felt simpler, when the choices were clearer. Or maybe he was just younger, and the world seemed bigger, and his place in it smaller. Now, the world felt small, and his problems felt huge, and he was just trying to find the right frequency to tune into.Memory is a funny thing. It's not a perfect recording of the past. It's a story we tell ourselves, a collage of images and feelings, edited and reedited over time. Some memories are sharp, crystal clear, like shards of glass. Others are faded, blurry, like old photographs left out in the sun. He tried to piece together the fragments of his memory, to make sense of what had happened. But the more he tried, the more the pieces seemed to shift and change, forming new patterns, telling different stories. The truth was a moving target, and he was always one step behind. He thought about the future, a vast, empty canvas waiting to be painted. But he had no paint, no brushes, only a sense of dread that coiled in his stomach like a snake. The future was a foreign country, and he didn't speak the language. He was a man out of time, a ghost from the past haunting the present. He wondered if there was a place for him in this new world, or if he was destined to wander forever, a relic of a bygone era. The only thing he knew for sure was that the future was coming, whether he was ready for it or not. And so he walked on, through the rain-swept streets, under the indifferent gaze of the neon gods. The city was a symphony of sounds, a cacophony of life and death, hope and despair. He was just one note in that symphony, a fleeting melody that would soon be lost in the noise. But for now, he was still here, still walking, still searching. And maybe, just maybe, that was enough. Maybe the search was the destination, and the journey was the home he had been looking for all along.`
];

const RepeatedText = () => {
  const repeatedBlocks = Array(100).fill(textBlocks).flat();
  return repeatedBlocks.map((text, index) => (
    <p key={index} style={styles.text}>
      {text}
    </p>
  ));
};

export default function Thought() {
  return (
    <div style={styles.container}>
      <RepeatedText />
    </div>
  );
}

const styles = {
  container: {
    padding: '0px',
    backgroundColor: '#f8f8f8'
  },
  text: {
    fontSize: '4px',
    lineHeight: '1',
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    color: '#111',
    margin: 0,
    textAlign: 'justify',
  },
};


