module.exports = {
  ownerName: "huyhung0210",
  getEmbedConfig: function () {
    return {
      color: "#80FF92",
      errorColor: "#FF8DA1",
      footer: `Made by ${this.ownerName} with ♥`,
    };
  },
  emotes: {
    error: "❌",
    success: "✅",
  },
  music: {
    filters: {
      remix:
        "atempo=1.17, bass=g=14:width_type=q, treble=g=20:width_type=s, atempo=1.16, highpass=f=200, lowpass=f=16000, afade=enable='between(t,0,5)':t=in:st=5, aecho=0.8:0.88:6:0.4, adelay=5000|5000, asetrate=48000*1.02, flanger=delay=30, afftdn=nt=w",
      remix2:
        "atempo=1.17, bass=g=20:f=120, treble=g=20:width_type=q, acrusher=level_in=0.9:level_out=0.4:bits=2:aa=1, asetrate=48000*1.03, highpass=f=200, lowpass=f=17000, flanger=delay=10:depth=5:regen=20:width=50:speed=1:shape=sinusoidal:phase=50:interp=linear, aecho=0.8:0.88:60:0.4, adelay=5000|5000, afade=enable='between(t,0,5)':t=in:st=5, afftdn=nt=w",
      lofi: "highpass=f=200, lowpass=f=3000, afftdn, atempo=0.87, asetrate=48000*0.95, afftdn=nt=w",
      cursed: "vibrato=f=6.5,tremolo,aresample=48000,asetrate=48000*1.25",
      rickroll:
        "bass=g=33,apulsator=hz=0.06,vibrato=f=2.5,tremolo,asetrate=48000*0.8",
      purebass: "bass=g=20,dynaudnorm=f=200,asubboost,apulsator=hz=0.08",
      earrape:
        "earwax,equalizer=f=1000:t=q:w=1:g=48,bass=g=40,dynaudnorm=f=400",
      fullaudio: "bass=g=7,dynaudnorm=f=200,apulsator=hz=0.08",
      super_bassboost: "bass=g=50,dynaudnorm=f=550",
    },
  },
};
