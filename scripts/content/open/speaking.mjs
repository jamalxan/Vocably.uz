// Open Testlar uchun Speaking bo'limlari (Vocably uchun yozilgan savollar — audio yo'q,
// foydalanuvchi o'z javobini yozib oladi). Har bir to'plam o'sha testning Reading/Listening
// mavzulariga yaqin, shuning uchun lug'at qayta ishlatiladi. Kalit — test raqami.
const set = (part1Questions, topic, bulletPoints, part3Questions) => ({
  durationSec: 780,
  part1Questions,
  part2CueCard: { topic, bulletPoints, prepSec: 60, speakSec: 120 },
  part3Questions,
});

export const SPEAKING = {
  1: set(
    ['Where do you live at the moment?', 'What do you like about the area you live in?', 'Do you prefer reading printed books or reading on a screen?', 'How often do you read for pleasure?', 'Have you ever visited the sea or the ocean?', 'Do you enjoy watching nature documentaries? Why or why not?'],
    'Describe an invention that has changed the way people live.',
    ['what the invention is', 'when it was invented, if you know', 'how people use it', 'and explain why you think it is so important'],
    ['Which inventions of the last hundred years have been most important?', 'Do you think new technology always makes life better?', 'Why do some people distrust medicines and doctors?', 'How can ordinary people help to protect the oceans?', 'Should governments spend more money on scientific research?'],
  ),
  2: set(
    ['Do you prefer tea or coffee? Why?', 'Is tea popular in your country?', 'What do you usually drink in the morning?', 'Do you like hot weather or cold weather?', 'Is the area where you live getting warmer?', 'Do you like walking in the city at night?'],
    'Describe a traditional drink or food from your country.',
    ['what it is', 'how it is made', 'when people usually have it', 'and explain why it is important in your culture'],
    ['Why do traditional foods and drinks remain popular?', 'How have eating and drinking habits changed in your country?', 'Why are cities usually hotter than the countryside?', 'What can cities do to keep cool in summer?', 'Should people be encouraged to plant more trees in cities?'],
  ),
  3: set(
    ['Do you enjoy travelling? Why or why not?', 'Have you ever travelled a long distance by road?', 'Which country would you most like to visit?', 'Do you like animals?', 'Have you ever kept a pet?', 'How much water do you drink every day?'],
    'Describe a historical place in your country that you have visited.',
    ['where it is', 'when you went there', 'what you saw there', 'and explain why this place is important'],
    ['Why is it important to preserve historical places?', 'How did trade between countries change people\'s lives in the past?', 'Should tourists pay more to visit historical sites?', 'Why is fresh water becoming scarce in some regions?', 'What can individuals do to save water?'],
  ),
  4: set(
    ['Do you prefer the mountains or the seaside?', 'Have you ever seen snow or ice in nature?', 'Do you grow any plants at home?', 'Where does most of the food you eat come from?', 'Do you like shopping for fresh food?', 'How often do you eat vegetables?'],
    'Describe a natural place that you would like to visit.',
    ['where it is', 'how you know about it', 'what you would like to do there', 'and explain why you want to visit it'],
    ['How is climate change affecting natural landscapes?', 'Should people be allowed to build homes near the coast?', 'Do you think farming will move into cities in the future?', 'What are the advantages of buying locally grown food?', 'Who should pay to protect natural areas — governments or visitors?'],
  ),
  5: set(
    ['Are there any famous buildings in your city?', 'Do you like learning about history?', 'Have you ever been stung by a bee?', 'Do you like honey?', 'How often do you visit a doctor?', 'What do you do when you feel ill?'],
    'Describe a famous building or monument you know about.',
    ['what and where it is', 'how you learned about it', 'what it looks like', 'and explain why it is famous'],
    ['Why do countries spend money on protecting old monuments?', 'Should famous buildings be free to visit?', 'How important are insects to the environment?', 'How have medicines changed people\'s lives in the last century?', 'Should new medicines be available to everyone, whatever the cost?'],
  ),
  6: set(
    ['Do you like visiting museums?', 'What kind of museum is your favourite?', 'Do you recycle things at home?', 'What do you usually do with old clothes?', 'Do you like mechanical things, such as clocks or engines?', 'Have you ever repaired something yourself?'],
    'Describe an interesting object you saw in a museum or exhibition.',
    ['what the object was', 'where you saw it', 'what you learned about it', 'and explain why it interested you'],
    ['Why are museums important for a country?', 'Should museums return objects to the countries they came from?', 'Why don\'t more people recycle?', 'Who is more responsible for reducing waste — companies or consumers?', 'Do you think people throw away too many things nowadays?'],
  ),
  7: set(
    ['Do you drink coffee? How often?', 'Are there many cafés where you live?', 'Do you like watching birds or other wild animals?', 'Do you use a library? Why or why not?', 'What kind of books do you like?', 'Where do you usually study?'],
    'Describe a library, bookshop or café where you like to spend time.',
    ['where it is', 'how often you go there', 'what you do there', 'and explain why you like this place'],
    ['Are libraries still important in the internet age?', 'Why do people enjoy meeting in cafés?', 'How have people\'s reading habits changed?', 'Why do some animals travel very long distances?', 'What can be done to protect animals that migrate between countries?'],
  ),
  8: set(
    ['Do you like eating chocolate or sweets?', 'Did you eat a lot of sweets as a child?', 'Have you ever been to the coast?', 'Is it often windy where you live?', 'How do you usually celebrate holidays?', 'Which holiday is your favourite?'],
    'Describe a national holiday or festival that is important in your country.',
    ['what the holiday is', 'when it is celebrated', 'what people do on that day', 'and explain why it is important to people'],
    ['Why are national holidays important?', 'Have holidays become too commercial?', 'What are the advantages and disadvantages of wind power?', 'Should people be willing to pay more for clean energy?', 'How do people in your country remember those who died in wars?'],
  ),
  9: set(
    ['Have you ever been in a hot air balloon or an aeroplane?', 'Would you like to fly in a balloon?', 'Do you use a lot of paper in your daily life?', 'Do you prefer to write by hand or type?', 'Are there any mountains near where you live?', 'Have you ever joined a club?'],
    'Describe a club or group that you belong to or would like to join.',
    ['what the club or group is', 'how you found out about it', 'what members do', 'and explain why you enjoy it or want to join'],
    ['What are the benefits of joining a club?', 'Is it better to learn a language with other people or alone?', 'Do you think paper will disappear in offices in the future?', 'How can people living near volcanoes stay safe?', 'Why do some people enjoy dangerous activities?'],
  ),
  10: set(
    ['Do you have a dog or another pet?', 'Do you prefer dogs or cats?', 'How do you usually check the time?', 'Do you always arrive on time?', 'How much time do you spend online every day?', 'Do you feel nervous when you speak English?'],
    'Describe a time when you felt nervous speaking in front of other people.',
    ['when and where it happened', 'who you were speaking to', 'what you said', 'and explain how you felt afterwards'],
    ['Why are some people afraid of speaking in public?', 'How can schools help children become more confident?', 'Should children be allowed to use social media?', 'How can young people be protected from bullying online?', 'Why have dogs been so important to humans throughout history?'],
  ),
  11: set(
    ['Can you ride a bicycle?', 'How often do you ride a bicycle?', 'Is cycling popular where you live?', 'Do you like visiting parks?', 'Is there a park near your home?', 'How do you usually prepare before you study?'],
    'Describe a park or public garden that you like to visit.',
    ['where it is', 'how often you go there', 'what people do there', 'and explain why you like it'],
    ['Why are public parks important in cities?', 'Should cities build more cycle lanes?', 'What are the advantages of cycling to work or school?', 'How can people prepare for natural disasters such as tsunamis?', 'Do you think people will live on the moon in the future?'],
  ),
};
