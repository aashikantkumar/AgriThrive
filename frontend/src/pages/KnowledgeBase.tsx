import { useState } from 'react';
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search,
  Droplets,
  Sprout,
  Leaf,
  Bug,
  Recycle,
  Tractor,
  Sun,
  Shield,
  FlaskConical,
  Trees
} from "lucide-react";

const AGRICULTURAL_PRACTICES = [
  {
    id: 1,
    title: "Crop Rotation",
    category: "Soil Management",
    icon: Recycle,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    description: "Crop rotation is the practice of growing different types of crops in the same area across sequential seasons. This ancient technique prevents soil depletion, breaks pest and disease cycles, and improves soil structure and fertility. In India, farmers typically rotate cereals with legumes or pulses. For example, wheat-rice-sugarcane or rice-wheat-mung bean rotations are common. Legumes fix atmospheric nitrogen, reducing fertilizer needs. This practice also helps manage weeds naturally and distributes nutrient demand evenly. Proper rotation planning considers climate, soil type, market demand, and water availability. Modern farmers use 3-4 year rotation cycles for optimal results."
  },
  {
    id: 2,
    title: "Drip Irrigation",
    category: "Water Management",
    icon: Droplets,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80",
    description: "Drip irrigation is a water-efficient method that delivers water directly to plant roots through a network of pipes, tubes, and emitters. This technology saves 30-70% water compared to traditional methods and is crucial for water-scarce regions in India. It reduces weed growth, minimizes soil erosion, and prevents fungal diseases by keeping foliage dry. The system allows precise fertilizer application (fertigation), improving nutrient use efficiency. Suitable for fruits, vegetables, and cash crops, drip irrigation increases yields by 20-90% while reducing labor costs. Government subsidies under PMKSY make it affordable for small farmers. Maintenance involves regular filter cleaning and checking for clogged emitters."
  },
  {
    id: 3,
    title: "Organic Farming",
    category: "Sustainable Practices",
    icon: Leaf,
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80",
    description: "Organic farming eliminates synthetic chemicals, relying on natural processes and biological materials for pest control and fertilization. It uses compost, green manure, vermicompost, and bio-fertilizers to enrich soil. Crop rotation, companion planting, and biological pest control maintain ecosystem balance. India has over 2.5 million organic farmers, making it a global leader. Organic produce commands premium prices in domestic and export markets. The practice improves soil health, biodiversity, and long-term sustainability. Certification through agencies like NPOP ensures market access. Challenges include lower initial yields, labor intensity, and certification costs. However, reduced input costs and better prices often compensate, improving farmer profitability over time."
  },
  {
    id: 4,
    title: "Integrated Pest Management",
    category: "Crop Protection",
    icon: Bug,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    description: "Integrated Pest Management (IPM) combines biological, cultural, physical, and chemical tools to minimize pest damage economically and environmentally. It emphasizes prevention through resistant varieties, proper spacing, and crop rotation. Regular field monitoring identifies pest levels before threshold damage occurs. Biological control uses natural predators like ladybugs, parasitic wasps, and Trichogramma. Cultural practices include trap crops, field sanitation, and optimal planting times. Pheromone traps attract and monitor specific pests. Chemical pesticides are used only as last resort, selecting least-toxic options. IPM reduces pesticide use by 50-70%, protects beneficial insects, and prevents pest resistance. Training programs by KVKs help farmers implement IPM effectively across India."
  },
  {
    id: 5,
    title: "Soil Health Management",
    category: "Soil Management",
    icon: FlaskConical,
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80",
    description: "Soil health management focuses on maintaining soil's physical, chemical, and biological properties for sustainable crop production. Regular soil testing determines nutrient deficiencies and pH levels, guiding fertilizer application. Adding organic matter through compost, crop residues, and green manuring improves soil structure, water retention, and microbial activity. Balanced fertilization using NPK based on soil tests prevents nutrient imbalances. Minimum tillage preserves soil structure and reduces erosion. Cover crops protect soil from erosion and add organic matter. Soil Health Cards provided by the government offer customized fertilizer recommendations. Healthy soil supports better root development, improves drought resistance, and increases yields. Earthworms and beneficial microbes indicate good soil health and contribute to nutrient cycling."
  },
  {
    id: 6,
    title: "Precision Agriculture",
    category: "Modern Technology",
    icon: Tractor,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
    description: "Precision agriculture uses GPS, sensors, drones, and data analytics to optimize field-level crop management. Variable rate technology applies inputs precisely where needed, reducing waste and costs. Soil sensors monitor moisture and nutrients in real-time, enabling smart irrigation. Drones capture multispectral images identifying pest infestations, nutrient deficiencies, and crop stress before visible symptoms appear. GPS-guided tractors ensure accurate seeding and spraying patterns. Weather stations and mobile apps provide localized forecasts for better planning. Yield mapping identifies productive and underperforming zones for targeted interventions. Though initial investment is high, large farms and FPOs benefit significantly from reduced input costs and increased efficiency. Government initiatives like Digital Agriculture Mission promote technology adoption among Indian farmers."
  },
  {
    id: 7,
    title: "Mulching",
    category: "Soil Management",
    icon: Sun,
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80",
    description: "Mulching involves covering soil surface with organic or inorganic materials to conserve moisture, control weeds, and regulate soil temperature. Organic mulches like straw, dried leaves, crop residues, and compost gradually decompose, enriching soil. Plastic mulching is popular for high-value vegetables and fruits, preventing weed growth and maintaining soil moisture. Black plastic absorbs heat, beneficial for early season crops, while white reflects heat for summer crops. Mulching reduces water evaporation by 50-70%, decreasing irrigation frequency. It prevents soil erosion, minimizes soil compaction, and moderates temperature fluctuations. Bio-degradable mulches are eco-friendly alternatives to plastic. Proper mulch thickness (7-10 cm for organic) and timing ensure effectiveness without promoting pests or diseases."
  },
  {
    id: 8,
    title: "Rainwater Harvesting",
    category: "Water Management",
    icon: Droplets,
    image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&q=80",
    description: "Rainwater harvesting captures and stores monsoon rainfall for agricultural use during dry periods. Farm ponds, check dams, and percolation tanks are common structures in rural India. These systems recharge groundwater, reduce runoff, and prevent soil erosion. A one-hectare farm pond can store 8,000-12,000 cubic meters of water, sufficient for supplementary irrigation. Contour bunding and trenches slow water flow, increasing soil infiltration. Roof rainwater harvesting provides clean water for livestock and domestic use. MGNREGA funds support community water harvesting projects. This practice is crucial in rain-fed areas covering 60% of Indian agriculture. Proper design considering catchment area, soil type, and rainfall patterns maximizes effectiveness. Regular desilting maintains storage capacity."
  },
  {
    id: 9,
    title: "Intercropping",
    category: "Crop Management",
    icon: Trees,
    image: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=800&q=80",
    description: "Intercropping grows two or more crops simultaneously on the same field in a definite pattern. This practice maximizes land use efficiency, increases total productivity, and provides risk insurance against crop failure. Common combinations include maize-soybean, cotton-green gram, and groundnut-pigeon pea. Crops with different rooting depths utilize soil nutrients at various levels, reducing competition. Taller crops provide shade for shade-tolerant species. Legumes intercropped with cereals fix nitrogen, benefiting subsequent crops. Intercropping suppresses weeds through canopy coverage and biodiversity. It also manages pests naturally as diverse crops confuse pests and harbor beneficial insects. Proper spacing and compatible crop selection are crucial. This traditional wisdom is increasingly recognized for climate resilience and sustainable intensification."
  },
  {
    id: 10,
    title: "Vermicomposting",
    category: "Organic Practices",
    icon: Sprout,
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
    description: "Vermicomposting uses earthworms to decompose organic waste into nutrient-rich humus-like material called vermicompost. This bio-fertilizer contains essential nutrients in plant-available forms, beneficial microorganisms, and growth hormones. The process is faster than traditional composting (45-60 days) and odorless when properly managed. Suitable materials include crop residues, kitchen waste, animal manure, and paper. Eisenia fetida (red wigglers) is the preferred species for tropical conditions. Vermicompost improves soil structure, water-holding capacity, and microbial activity. It's particularly valuable for organic farming and high-value crops. Small-scale units require minimal investment and space, making them ideal for marginal farmers. Commercial vermicompost production also provides additional income opportunities."
  }
];

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(AGRICULTURAL_PRACTICES.map(p => p.category))];

  const filteredPractices = AGRICULTURAL_PRACTICES.filter(practice => {
    const matchesSearch = practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         practice.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || practice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-lg">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Agricultural Knowledge Base</h1>
              <p className="text-muted-foreground">Essential farming practices for modern Indian agriculture</p>
            </div>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search practices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPractices.map((practice) => {
              const Icon = practice.icon;
              return (
                <Card key={practice.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={practice.image}
                      alt={practice.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                        {practice.category}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{practice.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {practice.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {filteredPractices.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No practices found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          )}

          <Card className="mt-8 bg-muted/30">
            <CardHeader>
              <CardTitle>About This Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                This knowledge base provides comprehensive information about modern agricultural practices adopted across India. 
                Each practice is carefully documented to help farmers make informed decisions about crop management, resource 
                conservation, and sustainable farming. These practices are recommended by agricultural universities, research 
                institutes, and Krishi Vigyan Kendras (KVKs) across the country. For specific guidance tailored to your region 
                and crop type, please consult your local agricultural extension officer or KVK.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;